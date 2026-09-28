import { useState, useEffect } from 'react';
import { MagneticButton, SectionDivider } from '../ui/Primitives';
import BorderGlow from '../ui/BorderGlow';
import { PATHWAYS, DESTINATIONS, EMISSION_FACTORS } from '../../data/domain';
import { solveAllocation } from '../../engine/solver';
import { ArrowRight, ArrowLeft, Target, DollarSign, Zap, Sliders, Truck, MapPin, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

const PATHWAY_COLORS = {
  scm: 'var(--indigo)',
  geopolymer: 'var(--violet)',
  road_base: 'var(--amber)',
  mine_backfill: 'var(--emerald)',
  disposal: 'var(--red)',
};

export default function AllocationStep({ wasteParams, complianceResults, onSolutionReady, onNext, onBack }) {
  const [priority, setPriority] = useState('economic');
  // Practical freight rate: ₹3.20/t-km (Indian NH multi-axle standard)
  const [freightRate, setFreightRate] = useState(3.2);
  // Practical carbon price: ₹0 to ₹2500/tCO₂e
  const [carbonPrice, setCarbonPrice] = useState(0);
  const [solution, setSolution] = useState(null);

  useEffect(() => {
    const result = solveAllocation(wasteParams, complianceResults, priority, freightRate, carbonPrice);
    setSolution(result);
    if (onSolutionReady) onSolutionReady(result);
  }, [wasteParams, complianceResults, priority, freightRate, carbonPrice]);

  if (!solution) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Solving…</div>;

  const {
    allocations,
    disposalQty,
    disposalCost,
    totalAllocated,
    totalQty,
    grossBuyerRevenue,
    totalPrepCost,
    totalFreightCost,
    totalRevenue,
    diversionRate,
    baselineCost,
    avoidedDisposalCost,
    costSavings,
    totalNetEmissionSaving
  } = solution;

  const perTonneNetRevenue = totalAllocated > 0 ? totalRevenue / totalQty : 0;
  const perTonneDisposalCost = EMISSION_FACTORS.disposal_gate_fee;
  const perTonneAdvantage = totalQty > 0 ? costSavings / totalQty : 0;

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <Target size={11} />
          Step 6 of 6 — Optimization Engine
        </div>
        <h1>Optimal Routing & Practical Unit Economics</h1>
        <p className="subtitle">
          Material is dynamically routed across qualified off-takers to maximize net commercial margin vs. 
          ash pond disposal liability (benchmarked at ₹320/t standard NTPC/CPCB operational cost).
        </p>
      </div>

      {/* Priority & sensitivity controls wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.8}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0e0e0e"
        glowColor="0 0 100"
        colors={['#ffffff', '#888888', '#222222']}
        className="w-full"
      >
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                <Sliders size={11} style={{ display: 'inline', marginRight: 6 }} />
                Optimization Priority
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { key: 'economic', label: 'Economic Margin', icon: <DollarSign size={13} />, color: 'var(--emerald)' },
                  { key: 'emissions', label: 'Emissions (CO₂)', icon: <Zap size={13} />, color: 'var(--cyan)' },
                  { key: 'balanced', label: 'Balanced ESG', icon: <Target size={13} />, color: 'var(--violet)' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setPriority(opt.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 8, border: '1px solid',
                      borderColor: priority === opt.key ? opt.color : 'var(--border)',
                      background: priority === opt.key ? `${opt.color}18` : 'var(--bg-raised)',
                      color: priority === opt.key ? opt.color : 'var(--text-muted)',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      transition: 'all 0.2s',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {/* Freight Rate Slider */}
              <div style={{ minWidth: 220 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span><Truck size={11} style={{ display: 'inline', marginRight: 4 }} />Freight Rate</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 700 }}>
                    ₹{freightRate.toFixed(2)}/t-km
                  </span>
                </label>
                <input
                  type="range"
                  className="slider"
                  min={1.5}
                  max={5.5}
                  step={0.1}
                  value={freightRate}
                  onChange={e => setFreightRate(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--amber) ${((freightRate - 1.5) / 4.0) * 100}%, var(--bg-hover) 0%)`
                  }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Indian NH HGV standard (~₹2.8–₹3.8/t-km)
                </div>
              </div>

              {/* Carbon Price Slider */}
              <div style={{ minWidth: 220 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Carbon Credit Monetization</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 700 }}>
                    ₹{carbonPrice}/tCO₂e
                  </span>
                </label>
                <input
                  type="range"
                  className="slider"
                  min={0}
                  max={2500}
                  step={50}
                  value={carbonPrice}
                  onChange={e => setCarbonPrice(parseInt(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--cyan) ${(carbonPrice / 2500) * 100}%, var(--bg-hover) 0%)`
                  }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Voluntary Carbon Market (VCM credits)
                </div>
              </div>
            </div>
          </div>
        </div>
      </BorderGlow>

      {/* KPI Tiles Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          {
            label: 'Landfill Diversion',
            value: `${diversionRate}%`,
            sub: `${totalAllocated.toLocaleString()} of ${totalQty.toLocaleString()} t/mo diverted`,
            color: 'var(--cyan)',
            unit: 'stream diverted'
          },
          {
            label: 'Net Offtake Cash Flow',
            value: `${totalRevenue >= 0 ? '+' : ''}₹${Math.round(totalRevenue).toLocaleString('en-IN')}`,
            sub: `${totalRevenue >= 0 ? '+' : ''}₹${perTonneNetRevenue.toFixed(0)}/t net operational margin`,
            color: totalRevenue >= 0 ? 'var(--emerald)' : 'var(--red)',
            unit: '/month'
          },
          {
            label: 'Avoided Disposal Cost',
            value: `₹${Math.round(avoidedDisposalCost).toLocaleString('en-IN')}`,
            sub: `Saved @ ₹${perTonneDisposalCost}/t ash pond OPEX`,
            color: 'var(--emerald)',
            unit: '/month'
          },
          {
            label: 'Total Value vs. Disposal',
            value: `+₹${Math.round(costSavings).toLocaleString('en-IN')}`,
            sub: `+₹${perTonneAdvantage.toFixed(0)}/t total financial turnaround`,
            color: '#ffffff',
            unit: '/month'
          },
        ].map((s, i) => (
          <div key={s.label} className="stat-tile anim-scale-in" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div className="sub">{s.unit} · {s.sub}</div>
          </div>
        ))}
      </div>

      {/* Practical Financial Comparison: 100% Disposal vs Optimized Routing */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0c0c0c"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} style={{ color: '#ffffff' }} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff' }}>
                Practical Economic Breakdown: Baseline Disposal vs. Optimized Routing
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Monthly production volume: <strong style={{ color: '#ffffff' }}>{totalQty.toLocaleString()} tonnes</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left Card: 100% Disposal Baseline */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>
                  <span>🗑️</span> Baseline: 100% Ash Pond Disposal
                </div>
                <span style={{ fontSize: 10, color: 'var(--red)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                  Direct Liability
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Disposal Volume:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#ffffff' }}>{totalQty.toLocaleString()} t/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Disposal Gate Fee / Pond OPEX:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>-₹{perTonneDisposalCost}/tonne</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Offtake Commercial Revenue:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#888888' }}>₹0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Pond Maintenance, Pumping & Tailings Monitoring:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>-₹{Math.round(baselineCost).toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              <div style={{
                marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Net Monthly Cost to Plant:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: 'var(--red)' }}>
                  -₹{Math.round(baselineCost).toLocaleString('en-IN')}
                  <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>(-₹{perTonneDisposalCost}/t)</span>
                </span>
              </div>
            </div>

            {/* Right Card: Optimized Routing Plan */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--emerald)' }}>
                  <span>⚡</span> Optimized Multi-Pathway Routing
                </div>
                <span style={{ fontSize: 10, color: 'var(--emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                  {diversionRate}% Diverted
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Gross Buyer Offtake Revenue:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 600 }}>
                    +₹{Math.round(grossBuyerRevenue).toLocaleString('en-IN')}/mo
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                      (+₹{(grossBuyerRevenue / (totalAllocated || 1)).toFixed(0)}/t)
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Quality Prep & NABL Testing:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#d4d4d4' }}>
                    -₹{Math.round(totalPrepCost).toLocaleString('en-IN')}/mo
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                      (-₹{(totalPrepCost / (totalAllocated || 1)).toFixed(0)}/t)
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Road Logistics Freight (@₹{freightRate.toFixed(2)}/t-km):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#d4d4d4' }}>
                    -₹{Math.round(totalFreightCost).toLocaleString('en-IN')}/mo
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                      (-₹{(totalFreightCost / (totalAllocated || 1)).toFixed(0)}/t)
                    </span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Residual Ash Pond Disposal ({disposalQty} t):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: disposalQty > 0 ? 'var(--red)' : '#888888' }}>
                    -₹{Math.round(disposalCost).toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: 'auto', paddingTop: 10, borderTop: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Net Operating Cash Flow:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: totalRevenue >= 0 ? 'var(--emerald)' : 'var(--red)' }}>
                  {totalRevenue >= 0 ? '+' : ''}₹{Math.round(totalRevenue).toLocaleString('en-IN')}
                  <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>
                    ({totalRevenue >= 0 ? '+' : ''}₹{perTonneNetRevenue.toFixed(0)}/t)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Arbitrage Callout Banner */}
          <div style={{
            marginTop: 18, padding: '12px 18px', borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} style={{ color: '#ffffff', flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#ffffff' }}>Net Economic Arbitrage:</strong> By diverting{' '}
                {totalAllocated.toLocaleString()} tonnes from the ash pond, you eliminate{' '}
                <strong style={{ color: 'var(--emerald)' }}>₹{Math.round(avoidedDisposalCost).toLocaleString('en-IN')}</strong> in disposal costs{' '}
                and generate{' '}
                <strong style={{ color: 'var(--emerald)' }}>{totalRevenue >= 0 ? '+' : ''}₹{Math.round(totalRevenue).toLocaleString('en-IN')}</strong> in net off-take margins.
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Financial Turnaround</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 800, color: '#ffffff' }}>
                +₹{Math.round(costSavings).toLocaleString('en-IN')}/mo
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--emerald)', marginLeft: 6 }}>
                  (+₹{perTonneAdvantage.toFixed(0)}/tonne)
                </span>
              </div>
            </div>
          </div>
        </div>
      </BorderGlow>

      {/* Allocation breakdown table wrapped in BorderGlow */}
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
        <div style={{ padding: '20px 24px' }}>
          <SectionDivider label="Destination-by-Destination Commercial & Logistics Allocation" />
          
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '220px 1fr 90px 85px 100px 110px 110px 130px',
            gap: 10, padding: '0 0 10px', borderBottom: '1px solid var(--border)'
          }}>
            {[
              'Destination', 'Allocation Share', 'Tonnes', 'Haul Dist',
              'Gross Buy', 'Prep & Freight', 'Net Margin', 'Advantage vs Pond'
            ].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Allocation Rows */}
          {allocations.map((a, i) => {
            const pct = (a.allocated / wasteParams.quantity) * 100;
            const color = PATHWAY_COLORS[a.type] || 'var(--cyan)';
            const isNeg = a.netRevenuePerTonne < 0;
            const prepAndFreight = a.pathway.prepCost + (a.distance * freightRate);
            const advantage = a.advantageVsDisposalPerTonne;

            return (
              <div
                key={a.id}
                style={{
                  display: 'grid', gridTemplateColumns: '220px 1fr 90px 85px 100px 110px 110px 130px',
                  gap: 10, alignItems: 'center', padding: '14px 0',
                  borderBottom: '1px solid var(--border)',
                  animation: `fadeUp 0.4s ${i * 60}ms both`,
                }}
              >
                {/* Destination info */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <MapPin size={9} style={{ display: 'inline' }} /> {a.location}
                  </div>
                  <span className={`badge ${a.isConditional ? 'badge-conditional' : 'badge-pass'}`} style={{ marginTop: 4 }}>
                    {PATHWAYS[a.type]?.shortName}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(1)}% of stream</span>
                  </div>
                  <div className="alloc-bar-wrap">
                    <div className="alloc-bar" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>

                {/* Allocated Tonnes */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {a.allocated.toLocaleString()} t
                </div>

                {/* Distance */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                  <Truck size={10} style={{ display: 'inline', marginRight: 3 }} />
                  {a.distance} km
                </div>

                {/* Gross Buy Price */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--emerald)', fontWeight: 600 }}>
                  ₹{a.purchasePrice}/t
                </div>

                {/* Prep & Freight combined */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#a0a0a0' }}>
                  -₹{Math.round(prepAndFreight)}/t
                </div>

                {/* Net Margin */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: isNeg ? 'var(--amber)' : 'var(--emerald)' }}>
                  {isNeg ? '-' : '+'}₹{Math.abs(a.netRevenuePerTonne).toFixed(0)}/t
                </div>

                {/* Advantage vs Disposal */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
                  color: advantage >= 0 ? '#ffffff' : 'var(--red)',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  +{Math.round(advantage)}/t
                  <span style={{ fontSize: 9, color: 'var(--emerald)', fontWeight: 500 }}>saved</span>
                </div>
              </div>
            );
          })}

          {/* Disposal row (if any volume remains in ash pond) */}
          {disposalQty > 0 ? (
            <div style={{
              display: 'grid', gridTemplateColumns: '220px 1fr 90px 85px 100px 110px 110px 130px',
              gap: 10, alignItems: 'center', padding: '14px 0',
              borderTop: '1px solid var(--border-med)',
              background: 'rgba(239,68,68,0.04)', borderRadius: 8, marginTop: 4, paddingLeft: 6,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--red)' }}>Ash Pond / Tailings Storage</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Baseline pond disposal</div>
              </div>
              <div>
                <div className="alloc-bar-wrap">
                  <div className="alloc-bar" style={{ width: `${(disposalQty / wasteParams.quantity) * 100}%`, background: 'var(--red)' }} />
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>
                {disposalQty.toLocaleString()} t
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>5 km</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>₹0</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)' }}>-₹{perTonneDisposalCost}/t</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>
                -₹{perTonneDisposalCost}/t
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                Baseline
              </div>
            </div>
          ) : (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--emerald)'
            }}>
              <CheckCircle2 size={14} />
              <span><strong>100% of material diverted from ash pond.</strong> Zero active disposal fees incurred.</span>
            </div>
          )}
        </div>
      </BorderGlow>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onNext}>
          New Analysis <ArrowRight size={16} />
        </MagneticButton>
      </div>
    </div>
  );
}
