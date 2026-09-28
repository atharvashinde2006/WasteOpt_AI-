// Step 5: Cost + Carbon Engine
import { DESTINATIONS, EMISSION_FACTORS } from "../../data/domain";
import { MagneticButton, SectionDivider } from "../ui/Primitives";
import BorderGlow from "../ui/BorderGlow";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight, ArrowLeft, DollarSign } from "lucide-react";

function buildCostBreakdown(wasteParams, complianceResults) {
  const rows = [];
  for (const dest of DESTINATIONS) {
    if (dest.type === "disposal") continue;
    const c = complianceResults?.find(r => r.pathwayId === dest.type);
    if (!c || c.overallStatus === "fail") continue;
    const pathway = c.pathway || { shortName: dest.type.toUpperCase(), prepCost: 200, virginDisplacedPerTonne: 0.8 };
    const freightCost = dest.distance * EMISSION_FACTORS.freight_rate_inr_per_tkm;
    const netRev = dest.purchasePrice - pathway.prepCost - freightCost;
    const transportEmissions = dest.distance * EMISSION_FACTORS.freight_road_per_tkm;
    const processingEmissions = pathway.prepCost * 0.8;
    const displacedCredit = pathway.virginDisplacedPerTonne * 1000;
    const netEmission = displacedCredit + EMISSION_FACTORS.landfill_avoided_per_tonne - transportEmissions - processingEmissions;
    rows.push({
      name: dest.name.length > 16 ? dest.name.slice(0, 16) + "…" : dest.name,
      fullName: dest.name,
      type: dest.type,
      purchasePrice: dest.purchasePrice,
      prepCost: pathway.prepCost,
      freightCost: Math.round(freightCost),
      netRevPerTonne: Math.round(netRev),
      transportEmissions: parseFloat(transportEmissions.toFixed(2)),
      processingEmissions: parseFloat(processingEmissions.toFixed(2)),
      displacedCredit: parseFloat(displacedCredit.toFixed(2)),
      avoidedLandfill: EMISSION_FACTORS.landfill_avoided_per_tonne,
      netEmissionKg: parseFloat(netEmission.toFixed(2)),
      distance: dest.distance,
      pathway: pathway.shortName,
    });
  }
  rows.sort((a, b) => b.netRevPerTonne - a.netRevPerTonne);
  return rows;
}

export default function CostCarbonStep({ wasteParams, complianceResults, solution, onNext, onBack }) {
  const rows = buildCostBreakdown(wasteParams, complianceResults);
  const baselineCost = wasteParams.quantity * EMISSION_FACTORS.disposal_gate_fee;

  return (
    <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <DollarSign size={11} />
          Step 5 of 6 — Cost + Carbon Engine
        </div>
        <h1>Cost & Emission Calculator</h1>
        <p className="subtitle">
          Transport, processing, and revenue calculated per pathway. 
          Emission debits and credits itemized per destination using DEFRA 2023 / CEA India 2024 factors.
        </p>
      </div>

      {/* KPI summary wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={32}
        glowIntensity={0.8}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0e0e0e"
        glowColor="0 0 100"
        colors={['#ffffff', '#888888', '#222222']}
        className="w-full"
      >
        <div style={{
          padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
        }}>
          {[
            { label: "Disposal Baseline Cost", value: `₹${baselineCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, unit: "per month baseline" },
            { label: "Best Net Revenue", value: rows.length > 0 ? `+₹${rows[0].netRevPerTonne}/t` : "—", unit: `via ${rows[0]?.pathway || "—"}` },
            { label: "Best Emission Saving", value: rows.length > 0 ? `${Math.max(...rows.map(r => r.netEmissionKg)).toFixed(0)} kg/t` : "—", unit: "CO₂e saved / tonne" },
            { label: "Freight Rate", value: `₹${EMISSION_FACTORS.freight_rate_inr_per_tkm}/t-km`, unit: "Indian HGV standard" },
          ].map((s) => (
            <div key={s.label} className="stat-tile" style={{ background: "transparent", border: "none", padding: 0 }}>
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: "#ffffff", fontSize: 20 }}>{s.value}</div>
              <div className="sub">{s.unit}</div>
            </div>
          ))}
        </div>
      </BorderGlow>

      {/* Cost breakdown table wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0e0e0e"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ padding: "20px 24px" }}>
          <SectionDivider label="Per-Pathway Cost Breakdown (₹/tonne)" />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Destination", "Pathway", "Dist (km)", "Purchase Price", "Prep Cost", "Freight Cost", "Net Revenue/t"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border)", background: "transparent",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#ffffff" }}>{r.fullName}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: "rgba(255,255,255,0.08)", color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}>{r.pathway}</span>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{r.distance}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "#ffffff" }}>+₹{r.purchasePrice}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "#888888" }}>-₹{r.prepCost}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "#888888" }}>-₹{r.freightCost}</td>
                    <td style={{
                      padding: "10px 12px", fontFamily: "var(--font-mono)", fontWeight: 700,
                      color: r.netRevPerTonne >= 0 ? "#ffffff" : "#888888",
                    }}>{r.netRevPerTonne >= 0 ? "+" : ""}₹{r.netRevPerTonne}</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(255,255,255,0.02)", fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: "10px 12px", color: "#888888" }}>
                    Disposal Baseline (All-to-TSF / Ash Pond)
                  </td>
                  <td colSpan={3} style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: 11 }}>
                    Gate fee: ₹{EMISSION_FACTORS.disposal_gate_fee}/t
                  </td>
                  <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "#888888", fontWeight: 800 }}>
                    -₹{EMISSION_FACTORS.disposal_gate_fee}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BorderGlow>

      {/* Revenue bar chart wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0e0e0e"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ padding: "20px 24px" }}>
          <SectionDivider label="Net Revenue per Tonne by Destination (₹/t)" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={rows} barSize={28} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#888888", fontSize: 10 }} />
              <YAxis tick={{ fill: "#888888", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#ffffff", fontWeight: 600 }}
              />
              <Bar dataKey="netRevPerTonne" name="Net Revenue/t (₹)" radius={[4, 4, 0, 0]}>
                {rows.map((r, i) => (
                  <Cell key={i} fill={r.netRevPerTonne >= 0 ? "#ffffff" : "#444444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </BorderGlow>

      {/* Emission breakdown per pathway wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0e0e0e"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ padding: "20px 24px" }}>
          <SectionDivider label="Emission Factors per Pathway (kg CO₂e/t)" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {rows.map(r => (
              <div key={r.name} style={{
                background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
                padding: "14px 16px", border: "1px solid var(--border)",
              }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#ffffff", marginBottom: 10 }}>
                  {r.fullName}
                </div>
                {[
                  { label: "Displaced Virgin", value: `+${r.displacedCredit}` },
                  { label: "Avoided Disposal", value: `+${r.avoidedLandfill}` },
                  { label: "Transport Emission", value: `-${r.transportEmissions}` },
                  { label: "Processing Emission", value: `-${r.processingEmissions}` },
                ].map(e => (
                  <div key={e.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "4px 0", borderBottom: "1px solid var(--border)",
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "#e0e0e0" }}>{e.value}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 8, display: "flex", justifyContent: "space-between",
                  fontWeight: 800, fontSize: 13,
                }}>
                  <span style={{ color: "#ffffff" }}>Net Balance</span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    color: r.netEmissionKg >= 0 ? "#ffffff" : "#888888",
                  }}>
                    {r.netEmissionKg >= 0 ? "+" : ""}{r.netEmissionKg} kg CO₂e/t
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)",
            padding: "12px 14px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7,
            fontFamily: "var(--font-mono)", border: "1px solid var(--border)",
          }}>
            EF Standards: Road freight 0.105 kg CO₂e/t-km (Indian HGV, MoRTH 2023) · Grid factor 0.716 kg CO₂e/kWh (CEA India 2024)
            · OPC clinker 820 kg CO₂e/t (IEA 2023) · Avoided disposal 2.8 kg CO₂e/t (NTPC ash pond baseline)
          </div>
        </div>
      </BorderGlow>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onNext}>
          Run Optimization <ArrowRight size={16} />
        </MagneticButton>
      </div>
    </div>
  );
}
