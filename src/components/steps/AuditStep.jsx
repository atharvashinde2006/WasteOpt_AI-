import { useState } from 'react';
import { SpotlightCard, MagneticButton, SectionDivider, TiltCard } from '../ui/Primitives';
import { PATHWAYS, EMISSION_FACTORS } from '../../data/domain';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { ArrowLeft, Leaf, AlertCircle, BookOpen, CheckCircle2, RefreshCw } from 'lucide-react';

const METRIC_COLORS = {
  displaced: 'var(--emerald)',
  avoided_landfill: '#34d399',
  transport: 'var(--red)',
  processing: '#f87171',
};

function SystemBoundaryDiagram() {
  return (
    <div style={{
      background: 'var(--bg-base)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)', padding: '20px 24px',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 16 }}>
        📐 System Boundary — ISO 14044 Recycled Content (Cut-Off) Method
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Upstream excluded */}
        <div style={{
          border: '2px dashed rgba(239,68,68,0.3)', borderRadius: 10,
          padding: '12px 16px', background: 'rgba(239,68,68,0.04)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', marginBottom: 6, letterSpacing: '0.06em' }}>
            🚫 EXCLUDED — Upstream burden (zero allocation under Cut-Off)
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            • Coal combustion emissions from power plant (Scope 1 at power producer)<br />
            • Iron ore smelting & blast furnace emissions (Scope 1 at steel mill)<br />
            • Mining & mineral extraction energy<br />
            <strong style={{ color: 'var(--red)' }}>We do NOT claim any credit for preventing these — they are the responsibility of the primary producer.</strong>
          </div>
        </div>

        {/* System boundary box */}
        <div style={{
          border: '2px solid rgba(16,185,129,0.35)', borderRadius: 10,
          padding: '16px 18px', background: 'rgba(16,185,129,0.04)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald)', marginBottom: 10, letterSpacing: '0.06em' }}>
            ✅ SYSTEM BOUNDARY — Credits and debits we count
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--emerald)', marginBottom: 6 }}>
                Emission CREDITS (avoided)
              </div>
              <ul style={{ paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <li><strong>Displaced virgin production:</strong> OPC clinker not manufactured (0.82 tCO₂e/t), quarried aggregate not blasted (0.008 tCO₂e/t) — calculated at the BUYER's production facility</li>
                <li><strong>Avoided disposal operations:</strong> No bulldozer compaction, slurry pumping, or landfill dust suppression (3.8 kg CO₂e/t) — DEFRA 2023 landfill operations factor</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', marginBottom: 6 }}>
                Emission DEBITS (new impacts)
              </div>
              <ul style={{ paddingLeft: 16, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <li><strong>Road freight:</strong> 0.096 kg CO₂e/t-km (DEFRA 2023 HGV average, diesel)</li>
                <li><strong>Pre-treatment processing:</strong> Electricity for drying, grinding, magnetic separation — converted at 0.716 kg CO₂e/kWh (India national grid, CEA 2024)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Double-counting proof */}
        <div style={{
          border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10,
          padding: '12px 16px', background: 'rgba(99,102,241,0.05)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--indigo)', marginBottom: 6, letterSpacing: '0.06em' }}>
            🔒 NO DOUBLE-COUNTING PROOF — Scope Attribution
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong>Rule:</strong> If the cement plant (buyer) claims the OPC displacement credit in their Scope 3 Category 1 (purchased goods) reporting,
            then the waste producer reports only the Scope 3 Category 5 (waste generated in operations) landfill-avoidance credit.
            Each tonne of CO₂e reduction is assigned to <em>one</em> reporting entity only — never split between producer and buyer simultaneously.
            This platform defaults to <strong>producer perspective</strong> (landfill avoidance only for Scope 3 C5),
            with the virgin displacement credit shown as a <em>system-level</em> benefit that cannot be simultaneously claimed by the producer.
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonPanel({ solution, wasteParams }) {
  const { baselineCost, netCostOptimized, costSavings, totalNetEmissionSaving, diversionRate, totalAllocated, disposalQty, allocations } = solution;

  const cars = (totalNetEmissionSaving * 1000 / 4600).toFixed(0); // avg passenger car ~4.6 tCO2e/yr

  return (
    <div className="comparison-grid">
      {/* Baseline */}
      <div className="comparison-side baseline">
        <div className="comparison-label red">⚠️ Baseline — All to Disposal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Diverted to Reuse', value: '0 t', sub: '0% diversion rate' },
            { label: 'Remaining in Landfill', value: `${wasteParams.quantity.toLocaleString()} t/mo`, sub: '100% landfill / TSF' },
            { label: 'Monthly Disposal Cost', value: `₹${baselineCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `at ₹${EMISSION_FACTORS.disposal_gate_fee.toLocaleString('en-IN')}/t gate fee`, valueColor: 'var(--red)' },
            { label: 'Net CO₂e Impact', value: '0 tCO₂e saved', sub: 'no displacement credit' },
            { label: 'Virgin Material Displaced', value: 'None', sub: 'full virgin production continues' },
          ].map(row => (
            <div key={row.label} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{row.label}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: row.valueColor || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* VS */}
      <div className="comparison-vs">
        <div className="vs-circle">VS</div>
      </div>

      {/* Optimized */}
      <div className="comparison-side optimized">
        <div className="comparison-label green">✅ Optimized — WasteOpt Routing</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Diverted to Reuse', value: `${totalAllocated.toLocaleString()} t/mo`, sub: `${diversionRate}% diversion rate`, valueColor: 'var(--emerald)' },
            { label: 'Remaining in Landfill', value: `${disposalQty.toLocaleString()} t/mo`, sub: `${(100 - diversionRate).toFixed(1)}% landfill / TSF`, valueColor: disposalQty === 0 ? 'var(--emerald)' : 'var(--amber)' },
            { label: 'Net Monthly Cost', value: `$${Math.abs(netCostOptimized).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: costSavings >= 0 ? `saving $${costSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo vs. disposal` : 'net logistics cost', valueColor: netCostOptimized < 0 ? 'var(--emerald)' : 'var(--amber)' },
            { label: 'Net CO₂e Saved', value: `${totalNetEmissionSaving.toFixed(1)} tCO₂e/mo`, sub: `≈ ${cars} passenger cars off road/yr`, valueColor: 'var(--emerald)' },
            { label: 'Virgin Material Displaced', value: `${allocations.map(a => PATHWAYS[a.type]?.virginType).filter((v, i, arr) => arr.indexOf(v) === i).join(', ')}`, sub: 'production avoided at buyer site' },
          ].map(row => (
            <div key={row.label} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 3 }}>{row.label}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: row.valueColor || 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AuditStep({ solution, wasteParams, onBack, onRestart }) {
  const [activeTab, setActiveTab] = useState('comparison');

  if (!solution) return null;

  const { emissionAudit, allocations } = solution;

  // Bar chart data for per-destination breakdown
  const chartData = allocations.map(a => ({
    name: a.name?.length > 14 ? a.name.slice(0, 14) + '…' : a.name,
    displaced: parseFloat(a.totalDisplacedCredit.toFixed(2)),
    avoided: parseFloat(a.totalAvoidedLandfill.toFixed(2)),
    transport: -parseFloat(a.totalTransportEmissions.toFixed(2)),
    processing: -parseFloat(a.totalProcessEmissions.toFixed(2)),
    net: parseFloat(a.totalNetEmissionSaving.toFixed(2)),
  }));

  const auditRows = allocations.map(a => {
    const p = PATHWAYS[a.type];
    return {
      dest: a.name,
      pathway: p?.shortName,
      tonnes: a.allocated,
      displaced: a.totalDisplacedCredit.toFixed(2),
      avoidedLandfill: a.totalAvoidedLandfill.toFixed(2),
      transport: a.totalTransportEmissions.toFixed(2),
      processing: a.totalProcessEmissions.toFixed(2),
      net: a.totalNetEmissionSaving.toFixed(2),
      efRef: `DEFRA 2023 / IPCC AR6`,
    };
  });

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <Leaf size={11} />
          Step 4 of 4 — Emissions Audit & Comparison
        </div>
        <h1>Impact Assessment & Audit Report</h1>
        <p className="subtitle">
          Full accounting of diverted material, financial outcomes, and net emissions change versus the disposal baseline.
          Methodology is made fully transparent to eliminate double-counting.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ maxWidth: 480 }}>
        {[
          { key: 'comparison', label: 'Baseline vs. Optimized' },
          { key: 'audit', label: 'Emissions Audit Table' },
          { key: 'methodology', label: 'Methodology & Boundary' },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'comparison' && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <ComparisonPanel solution={solution} wasteParams={wasteParams} />

          {/* Net emissions chart */}
          <SpotlightCard style={{ padding: '20px 24px' }}>
            <SectionDivider label="Net CO₂e by Destination (tCO₂e/mo)" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} margin={{ top: 16, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <RTooltip
                  contentStyle={{ background: '#1a2438', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                />
                <Bar dataKey="displaced" name="Displaced Virgin" stackId="credits" fill="var(--emerald)" radius={[0,0,0,0]} />
                <Bar dataKey="avoided" name="Avoided Disposal" stackId="credits" fill="#34d399" radius={[3,3,0,0]} />
                <Bar dataKey="transport" name="Transport" stackId="debits" fill="var(--red)" radius={[0,0,0,0]} />
                <Bar dataKey="processing" name="Processing" stackId="debits" fill="#f87171" radius={[0,0,3,3]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
              {[
                { label: 'Displaced Virgin', color: 'var(--emerald)' },
                { label: 'Avoided Disposal', color: '#34d399' },
                { label: 'Transport', color: 'var(--red)' },
                { label: 'Processing', color: '#f87171' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Summary totals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Displaced Virgin Production', value: emissionAudit.displacedVirginTotal.toFixed(2), color: 'var(--emerald)', unit: 'tCO₂e/mo', dir: '+' },
              { label: 'Avoided Disposal Ops', value: emissionAudit.avoidedLandfillTotal.toFixed(2), color: '#34d399', unit: 'tCO₂e/mo', dir: '+' },
              { label: 'Road Transport Emissions', value: emissionAudit.transportTotal.toFixed(2), color: 'var(--red)', unit: 'tCO₂e/mo', dir: '−' },
              { label: 'Processing Emissions', value: emissionAudit.processingTotal.toFixed(2), color: '#f87171', unit: 'tCO₂e/mo', dir: '−' },
            ].map(s => (
              <div key={s.label} className="stat-tile">
                <div className="label">{s.label}</div>
                <div className="value" style={{ color: s.color, fontSize: 22 }}>{s.dir} {s.value}</div>
                <div className="sub">{s.unit}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--emerald)', marginBottom: 6 }}>
                Net System CO₂e Saving
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--emerald)', fontFamily: 'var(--font-mono)', letterSpacing: '-1px' }}>
                {emissionAudit.netSaving.toFixed(1)} tCO₂e/mo
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                = {(emissionAudit.netSaving * 12).toFixed(0)} tCO₂e annually ·
                ≈ {((emissionAudit.netSaving * 1000) / 4600).toFixed(0)} passenger cars taken off road per year
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Formula</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                ΔE = E_displaced_virgin + E_avoided_disposal<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;− E_transport − E_processing
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="anim-fade-up">
          <SpotlightCard style={{ overflow: 'auto' }}>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Pathway</th>
                  <th>Tonnes</th>
                  <th>Displaced Virgin (tCO₂e)</th>
                  <th>Avoided Disposal (tCO₂e)</th>
                  <th>Transport −(tCO₂e)</th>
                  <th>Processing −(tCO₂e)</th>
                  <th>Net (tCO₂e)</th>
                  <th>EF Source</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.dest}</td>
                    <td><span className="badge badge-pass">{row.pathway}</span></td>
                    <td className="mono">{row.tonnes.toLocaleString()}</td>
                    <td className="mono credit">+{row.displaced}</td>
                    <td className="mono credit">+{row.avoidedLandfill}</td>
                    <td className="mono debit">−{row.transport}</td>
                    <td className="mono debit">−{row.processing}</td>
                    <td className="mono" style={{ fontWeight: 700, color: parseFloat(row.net) >= 0 ? 'var(--emerald)' : 'var(--red)' }}>
                      {parseFloat(row.net) >= 0 ? '+' : ''}{row.net}
                    </td>
                    <td style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.efRef}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={3}>TOTAL</td>
                  <td className="mono credit">+{emissionAudit.displacedVirginTotal.toFixed(2)}</td>
                  <td className="mono credit">+{emissionAudit.avoidedLandfillTotal.toFixed(2)}</td>
                  <td className="mono debit">−{emissionAudit.transportTotal.toFixed(2)}</td>
                  <td className="mono debit">−{emissionAudit.processingTotal.toFixed(2)}</td>
                  <td className="mono" style={{ color: 'var(--emerald)' }}>+{emissionAudit.netSaving.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </SpotlightCard>

          <div className="info-box" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Emission Factor Reference</div>
            <div style={{ fontSize: 11, lineHeight: 1.8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Road freight: 0.096 kg CO₂e/t-km (DEFRA UK 2023, HGV 26–32t diesel, laden) |
              Grid electricity: 0.716 kg CO₂e/kWh (CEA India National Grid 2024) |
              OPC clinker production: 820 kg CO₂e/t (IEA Cement Production EF, calcination + fuel) |
              Crushed aggregate: 8 kg CO₂e/t (ECOINVENT 3.9, blasting + processing) |
              Landfill operations: 3.8 kg CO₂e/t (DEFRA 2023, inert landfill HGV compaction) |
              Carbon intensity: IPCC AR6 WG3 (2022)
            </div>
          </div>
        </div>
      )}

      {activeTab === 'methodology' && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SystemBoundaryDiagram />
          <div className="info-box">
            <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              📚 Governing Standards & References
            </div>
            <ul style={{ paddingLeft: 16, fontSize: 11, color: 'var(--text-muted)', lineHeight: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <li><strong>ISO 14040:2006 / 14044:2006</strong> — Life Cycle Assessment — Principles & Framework</li>
              <li><strong>GHG Protocol Corporate Standard (2015)</strong> — Scope 1, 2, 3 boundary definitions</li>
              <li><strong>PAS 2050:2011</strong> — Assessment of Life Cycle Greenhouse Gas Emissions of Goods and Services</li>
              <li><strong>DEFRA UK Greenhouse Gas Reporting — Conversion Factors 2023</strong> — freight transport & waste operations EFs</li>
              <li><strong>CEA India — CO2 Baseline Database for Indian Power Sector (2024)</strong> — grid electricity factor</li>
              <li><strong>IEA Cement Sector Decarbonisation Roadmap (2023)</strong> — OPC clinker carbon intensity</li>
              <li><strong>IPCC AR6 WG3 Chapter 9 (2022)</strong> — Industrial CO2 reduction pathways</li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} />
          Back to Allocation
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onRestart}>
          <RefreshCw size={15} />
          New Analysis
        </MagneticButton>
      </div>
    </div>
  );
}
