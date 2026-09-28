// Standards compliance engine & LP allocation solver

import { PATHWAYS, DESTINATIONS, EMISSION_FACTORS } from '../data/domain';

// ─── Standards Checker ────────────────────────────────────────────────────────
export function checkPathwayCompliance(wasteParams, pathwayId) {
  const pathway = PATHWAYS[pathwayId];
  if (!pathway) return null;

  const results = [];
  let allPassed = true;
  let conditionalCount = 0;

  for (const [param, spec] of Object.entries(pathway.criteria)) {
    const value = wasteParams[param];
    if (value === undefined) continue;

    let status = 'pass';
    let message = '';
    const formattedVal = typeof value === 'number' ? value.toFixed(2) : value;

    if (spec.max !== undefined && value > spec.max) {
      const excess = ((value - spec.max) / spec.max * 100).toFixed(1);
      if (value > spec.max * 1.25) {
        status = 'fail';
        allPassed = false;
        message = `${formattedVal}${spec.unit} exceeds limit ${spec.max}${spec.unit} by ${excess}%. Pre-treatment required.`;
      } else {
        status = 'conditional';
        conditionalCount++;
        message = `${formattedVal}${spec.unit} slightly exceeds ${spec.max}${spec.unit} — conditional with processing upgrade.`;
      }
    } else if (spec.min !== undefined && value < spec.min) {
      const deficit = ((spec.min - value) / spec.min * 100).toFixed(1);
      if (value < spec.min * 0.75) {
        status = 'fail';
        allPassed = false;
        message = `${formattedVal}${spec.unit} below minimum ${spec.min}${spec.unit} by ${deficit}%. Not suitable.`;
      } else {
        status = 'conditional';
        conditionalCount++;
        message = `${formattedVal}${spec.unit} marginally below ${spec.min}${spec.unit} — conditional with binder addition.`;
      }
    } else {
      message = `${formattedVal}${spec.unit} ✓ meets ${spec.min !== undefined ? '≥' : '≤'}${spec.min ?? spec.max}${spec.unit}`;
    }

    results.push({
      param,
      label: spec.label,
      value,
      spec,
      status,
      message,
      astmRef: spec.astmRef,
    });
  }

  const overallStatus = allPassed && conditionalCount === 0
    ? 'pass'
    : allPassed && conditionalCount > 0
    ? 'conditional'
    : 'fail';

  return {
    pathwayId,
    pathway,
    results,
    overallStatus,
    passCount: results.filter(r => r.status === 'pass').length,
    conditionalCount,
    failCount: results.filter(r => r.status === 'fail').length,
  };
}

export function runAllComplianceChecks(wasteParams) {
  return Object.keys(PATHWAYS).map(id => checkPathwayCompliance(wasteParams, id));
}

// ─── LP Allocation Solver (Greedy with constraint satisfaction) ────────────────
// ─── LP Allocation Solver (Greedy with constraint satisfaction) ────────────────
export function solveAllocation(
  wasteParams,
  complianceResults,
  priority = 'economic',
  customFreightRate = null,
  customCarbonPrice = 0
) {
  const totalQty = wasteParams.quantity;
  let remaining = totalQty;

  const activeFreightRate = customFreightRate !== null && !isNaN(customFreightRate) && customFreightRate > 0
    ? customFreightRate
    : EMISSION_FACTORS.freight_rate_inr_per_tkm;

  // Build eligible destination list with computed margins
  const eligibleDests = [];

  for (const dest of DESTINATIONS) {
    if (dest.type === 'disposal') continue;
    const compliance = complianceResults.find(c => c.pathwayId === dest.type);
    if (!compliance || compliance.overallStatus === 'fail') continue;

    const pathway = PATHWAYS[dest.type];
    const freightCostINR = dest.distance * activeFreightRate; // ₹/tonne
    const netRevenuePerTonne = dest.purchasePrice - pathway.prepCost - freightCostINR;
    
    // Transport emissions per tonne (kg CO2e)
    const transportEmissions = dest.distance * EMISSION_FACTORS.freight_road_per_tkm;
    // Processing emissions per tonne
    const processEmissions = pathway.prepCost * 0.8; // rough proxy
    // Displaced virgin emissions per tonne (kg CO2e)
    const displacedCredit = pathway.virginDisplacedPerTonne * 1000;
    // Avoided landfill emissions per tonne
    const avoidedLandfill = EMISSION_FACTORS.landfill_avoided_per_tonne;
    // Net emission saving per tonne (kg CO2e, positive = good)
    const netEmissionSavingKg = displacedCredit + avoidedLandfill - transportEmissions - processEmissions;

    // Carbon credit monetization per tonne (if carbon price is specified)
    const carbonRevenuePerTonne = customCarbonPrice > 0
      ? (Math.max(0, netEmissionSavingKg) / 1000) * customCarbonPrice
      : 0;

    // Advantage over disposal: sending material to buyer vs paying ash pond OPEX (-₹320/t)
    const advantageVsDisposalPerTonne = netRevenuePerTonne + EMISSION_FACTORS.disposal_gate_fee + carbonRevenuePerTonne;

    eligibleDests.push({
      ...dest,
      pathway,
      compliance,
      freightCostINR: freightCostINR.toFixed(0),
      netRevenuePerTonne,
      carbonRevenuePerTonne,
      advantageVsDisposalPerTonne,
      transportEmissions,
      processEmissions,
      displacedCredit,
      avoidedLandfill,
      netEmissionSavingKg,
      isConditional: compliance.overallStatus === 'conditional',
      score: priority === 'economic'
        ? (netRevenuePerTonne + carbonRevenuePerTonne)
        : priority === 'emissions'
        ? netEmissionSavingKg
        : ((netRevenuePerTonne + carbonRevenuePerTonne) * 0.5 + netEmissionSavingKg * 0.2), // balanced
    });
  }

  // Sort by priority score descending
  eligibleDests.sort((a, b) => b.score - a.score);

  const allocations = [];

  for (const dest of eligibleDests) {
    if (remaining <= 0) break;
    // Route is economically viable if it performs better than paying disposal fee (-₹320/t)
    if (dest.netRevenuePerTonne < -EMISSION_FACTORS.disposal_gate_fee && priority === 'economic') continue;

    const allocated = Math.min(remaining, dest.capacity);
    if (allocated <= 0) continue;

    allocations.push({
      ...dest,
      allocated,
      grossRevenue: allocated * dest.purchasePrice,
      totalPrepCost: allocated * dest.pathway.prepCost,
      totalFreightCost: allocated * (dest.distance * activeFreightRate),
      totalRevenue: allocated * (dest.netRevenuePerTonne + dest.carbonRevenuePerTonne),
      totalCarbonRevenue: allocated * dest.carbonRevenuePerTonne,
      totalAdvantageVsDisposal: allocated * dest.advantageVsDisposalPerTonne,
      totalTransportEmissions: (allocated * dest.transportEmissions) / 1000, // tCO2e
      totalProcessEmissions: (allocated * dest.processEmissions) / 1000,
      totalDisplacedCredit: (allocated * dest.displacedCredit) / 1000,
      totalAvoidedLandfill: (allocated * dest.avoidedLandfill) / 1000,
      totalNetEmissionSaving: (allocated * dest.netEmissionSavingKg) / 1000, // tCO2e
    });

    remaining -= allocated;
  }

  // Rest goes to landfill / Ash pond
  const disposalQty = remaining;
  const disposalCost = disposalQty * EMISSION_FACTORS.disposal_gate_fee;

  // Baseline scenario (all 100% to disposal)
  const baselineCost = totalQty * EMISSION_FACTORS.disposal_gate_fee;

  // Compute totals
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  const grossBuyerRevenue = allocations.reduce((s, a) => s + a.grossRevenue, 0);
  const totalPrepCost = allocations.reduce((s, a) => s + a.totalPrepCost, 0);
  const totalFreightCost = allocations.reduce((s, a) => s + a.totalFreightCost, 0);
  const totalOperatingCost = totalPrepCost + totalFreightCost;
  const totalRevenue = allocations.reduce((s, a) => s + a.totalRevenue, 0); // Net cash flow from reuse
  const totalCarbonRevenue = allocations.reduce((s, a) => s + a.totalCarbonRevenue, 0);
  const totalNetEmissionSaving = allocations.reduce((s, a) => s + a.totalNetEmissionSaving, 0);
  
  // Total cost incurred in optimized scenario (actual residual disposal cost minus net reuse profit)
  const netCostOptimized = disposalCost - totalRevenue;
  // Total economic advantage vs 100% disposal
  const costSavings = baselineCost - netCostOptimized;
  // Avoided disposal cost (the portion of disposal cost eliminated)
  const avoidedDisposalCost = totalAllocated * EMISSION_FACTORS.disposal_gate_fee;

  const diversionRate = ((totalAllocated / totalQty) * 100).toFixed(1);

  return {
    allocations,
    disposalQty,
    disposalCost,
    totalAllocated,
    totalQty,
    grossBuyerRevenue,
    totalPrepCost,
    totalFreightCost,
    totalOperatingCost,
    totalRevenue,
    totalCarbonRevenue,
    totalNetEmissionSaving,
    netCostOptimized,
    baselineCost,
    avoidedDisposalCost,
    costSavings,
    diversionRate: parseFloat(diversionRate),
    activeFreightRate,
    customCarbonPrice,
    // Emission audit breakdown
    emissionAudit: {
      displacedVirginTotal: allocations.reduce((s, a) => s + a.totalDisplacedCredit, 0),
      transportTotal: allocations.reduce((s, a) => s + a.totalTransportEmissions, 0),
      processingTotal: allocations.reduce((s, a) => s + a.totalProcessEmissions, 0),
      avoidedLandfillTotal: allocations.reduce((s, a) => s + a.totalAvoidedLandfill, 0),
      netSaving: totalNetEmissionSaving,
    }
  };
}
