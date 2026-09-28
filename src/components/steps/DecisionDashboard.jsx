// Step 8: Decision Dashboard — the final comprehensive view
// Allocation + Cost + Emission + Diversion + What-if Analysis

import { useState, useCallback } from "react";
import { PATHWAYS, EMISSION_FACTORS } from "../../data/domain";
import { SpotlightCard, MagneticButton, SectionDivider, TiltCard } from "../ui/Primitives";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import { ArrowLeft, RefreshCw, Target, Leaf, BarChart3, Sliders } from "lucide-react";

const PATH_COLORS = {
  scm: "#6366f1", geopolymer: "#8b5cf6", road_base: "#f59e0b",
  mine_backfill: "#10b981", disposal: "#ef4444",
};

// ─── Donut / Allocation Pie ──────────────────────────────────────────────────
function AllocationDonut({ solution }) {
  const { allocations, disposalQty } = solution;
  const data = [
    ...allocations.map(a => ({
      name: PATHWAYS[a.type]?.shortName || a.name,
      value: a.allocated,
      color: PATH_COLORS[a.type] || "#06b6d4",
    })),
    ...(disposalQty > 0 ? [{ name: "Disposal", value: disposalQty, color: "#ef4444" }] : []),
  ];

  return (
    <div style={{ textAlign: "center" }}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            dataKey="value" paddingAngle={3} stroke="none">
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
          <RTooltip
            contentStyle={{ background: "#1a2438", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)" }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
            {d.name}: {d.value.toLocaleString()}t
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cost Comparison Bar ─────────────────────────────────────────────────────
function CostComparisonBar({ solution }) {
  const { baselineCost, netCostOptimized, costSavings } = solution;
  const chartData = [
    { name: "Disposal Only", cost: Math.round(baselineCost / 1000), fill: "#ef4444" },
    { name: "Reuse Scenario", cost: Math.max(0, Math.round(netCostOptimized / 1000)), fill: "#10b981" },
  ];
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 40, left: 10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} unit="k" />
        <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={100} />
        <RTooltip
          formatter={(v) => [`₹${(v * 1000).toLocaleString("en-IN")}`, "Monthly Cost"]}
          contentStyle={{ background: "#1a2438", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
        />
        <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={28}>
          {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
          <LabelList dataKey="cost" position="right" formatter={v => `₹${v}k`}
            style={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── What-If Analysis ────────────────────────────────────────────────────────
function WhatIfPanel({ solution, wasteParams }) {
  const [freightMultiplier, setFreightMultiplier] = useState(1.0);
  const [carbonPrice, setCarbonPrice] = useState(0);
  const [buyerDemand, setBuyerDemand] = useState(1.0);

  const adjCostSavings = (solution.costSavings - (solution.totalAllocated * EMISSION_FACTORS.freight_rate_inr_per_tkm * 10 * (freightMultiplier - 1))) + (solution.totalNetEmissionSaving * carbonPrice);
  const adjEmission = solution.totalNetEmissionSaving * 0.9 * buyerDemand;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[
        { label: "Transport Cost", emoji: "🚛", value: freightMultiplier, min: 0.5, max: 3, step: 0.1, setValue: setFreightMultiplier, display: `${freightMultiplier.toFixed(1)}× baseline`, color: "var(--amber)" },
        { label: "Carbon Price", emoji: "🌿", value: carbonPrice, min: 0, max: 6720, step: 100, setValue: setCarbonPrice, display: `₹${carbonPrice}/tCO₂e`, color: "var(--cyan)" },
        { label: "Buyer Demand", emoji: "🏭", value: buyerDemand, min: 0.3, max: 1.5, step: 0.1, setValue: setBuyerDemand, display: `${Math.round(buyerDemand * 100)}% of capacity`, color: "var(--violet)" },
      ].map(s => (
        <div key={s.label} style={{ background: "var(--bg-raised)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>{s.emoji} {s.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: s.color, fontWeight: 600 }}>{s.display}</span>
          </div>
          <input type="range" className="slider" min={s.min} max={s.max} step={s.step}
            value={s.value} onChange={e => s.setValue(parseFloat(e.target.value))}
            style={{ background: `linear-gradient(to right, ${s.color} ${((s.value - s.min) / (s.max - s.min)) * 100}%, var(--bg-hover) 0%)` }}
          />
        </div>
      ))}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
        <div style={{
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "var(--radius-md)", padding: "12px 14px", textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Adjusted Savings
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: adjCostSavings >= 0 ? "var(--emerald)" : "var(--red)" }}>
            {adjCostSavings >= 0 ? "+" : ""}₹{Math.abs(adjCostSavings).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div style={{
          background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: "var(--radius-md)", padding: "12px 14px", textAlign: "center",
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Adj. CO₂e Saving
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 800, color: "var(--cyan)" }}>
            {adjEmission.toFixed(1)} tCO₂e
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Emission Impact Callout ──────────────────────────────────────────────────
function EmissionCallout({ solution }) {
  const { totalNetEmissionSaving } = solution;
  const annualTons = (totalNetEmissionSaving * 12).toFixed(0);
  const cars = ((totalNetEmissionSaving * 1000) / 4600).toFixed(0);
  const trees = (totalNetEmissionSaving * 1000 / 21.77).toFixed(0);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.08))",
      border: "1px solid rgba(16,185,129,0.25)", borderRadius: "var(--radius-xl)",
      padding: "24px 28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Leaf size={24} color="var(--emerald)" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "var(--emerald)" }}>Net CO₂e Saving — System Level</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            ISO 14044 Cut-Off Method · GHG Protocol Scope 3 · Producer Perspective
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 900, color: "var(--emerald)", lineHeight: 1 }}>
          {totalNetEmissionSaving.toFixed(1)}<span style={{ fontSize: 14, marginLeft: 4, color: "var(--text-muted)" }}>tCO₂e/mo</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { icon: "📅", label: "Annualized", value: `${annualTons} tCO₂e/yr` },
          { icon: "🚗", label: "Cars off road/yr", value: `${cars} vehicles` },
          { icon: "🌳", label: "Tree equivalent", value: `${trees} trees/yr` },
        ].map(e => (
          <div key={e.label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{e.icon}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "var(--emerald)" }}>{e.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DecisionDashboard({ solution, wasteParams, onBack, onRestart }) {
  const [activeTab, setActiveTab] = useState("overview");
  if (!solution) return null;

  const { diversionRate, totalAllocated, totalRevenue, costSavings, allocations } = solution;

  return (
    <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <BarChart3 size={11} />
          Step 8 of 8 — Decision Dashboard
        </div>
        <h1>Complete Decision Report</h1>
        <p className="subtitle">
          Allocation, cost, diversion rate, CO₂e impact and explainability — 
          everything you need to make and defend the routing decision.
        </p>
      </div>

      {/* Hero KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Waste Diverted", value: `${diversionRate}%`, sub: `${totalAllocated.toLocaleString()} t/mo from landfill`, color: "var(--emerald)" },
          { label: "Net Revenue", value: `₹${Math.abs(totalRevenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: totalRevenue >= 0 ? "earned from reuse" : "logistics cost", color: totalRevenue >= 0 ? "var(--emerald)" : "var(--red)" },
          { label: "Monthly Savings", value: `₹${Math.abs(costSavings).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, sub: costSavings >= 0 ? "vs all-to-disposal" : "extra over disposal", color: costSavings >= 0 ? "var(--cyan)" : "var(--amber)" },
          { label: "CO₂e Saved", value: `${solution.totalNetEmissionSaving.toFixed(1)}`, sub: "tCO₂e / month", color: "var(--violet)" },
        ].map((s, i) => (
          <TiltCard key={s.label} maxTilt={4}>
            <div className="stat-tile anim-scale-in" style={{ animationDelay: `${i * 60}ms`, height: "100%" }}>
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
              <div className="sub">{s.sub}</div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: "overview", label: "📊 Overview", },
          { key: "whatif", label: "🔄 What-If Analysis" },
          { key: "audit", label: "📋 Audit Report" },
        ].map(t => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <SpotlightCard style={{ padding: "20px" }}>
              <SectionDivider label="Waste Allocation" />
              <AllocationDonut solution={solution} />
            </SpotlightCard>
            <SpotlightCard style={{ padding: "20px" }}>
              <SectionDivider label="Cost Comparison (₹'000/mo)" />
              <CostComparisonBar solution={solution} />
            </SpotlightCard>
          </div>
          <EmissionCallout solution={solution} />
        </div>
      )}

      {/* What-if tab */}
      {activeTab === "whatif" && (
        <div className="anim-fade-up">
          <SpotlightCard style={{ padding: "20px 24px" }}>
            <SectionDivider label="Sensitivity Analysis — Adjust Assumptions" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <WhatIfPanel solution={solution} wasteParams={wasteParams} />
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--text-secondary)" }}>How to use:</strong> Adjust the sensitivity sliders to model
                  different diesel price scenarios (freight cost), carbon credit pricing under voluntary or compliance
                  markets, and buyer demand fluctuations. The adjusted savings and emission figures update in real-time.
                </div>
                <div style={{ background: "var(--bg-raised)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-primary)", marginBottom: 10 }}>
                    📌 Key Sensitivities for Indian Context
                  </div>
                  {[
                    { scenario: "Diesel +30% (₹123/L)", impact: "Freight cost rises ~₹1/t-km → reduces margin on distant buyers" },
                    { scenario: "Carbon credit ₹1,000/tCO₂e", impact: "Adds ₹820/t for SCM pathway; changes allocation priority dramatically" },
                    { scenario: "Buyer demand at 70%", impact: "More material goes to disposal; diversion rate drops proportionally" },
                  ].map(s => (
                    <div key={s.scenario} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 600, fontSize: 11, color: "var(--cyan)", marginBottom: 3 }}>{s.scenario}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Audit tab */}
      {activeTab === "audit" && (
        <div className="anim-fade-up">
          <SpotlightCard style={{ overflow: "auto" }}>
            <div style={{ padding: "20px 24px" }}>
              <SectionDivider label="Full Allocation & Emission Audit" />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Destination", "Pathway", "Allocated t", "Revenue ₹", "Transport CO₂e", "Displaced CO₂e", "Net CO₂e"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 14px", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border)", background: "var(--bg-base)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: `${PATH_COLORS[a.type] || "#06b6d4"}18`, color: PATH_COLORS[a.type] || "#06b6d4",
                      }}>{PATHWAYS[a.type]?.shortName}</span>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {a.allocated.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: a.totalRevenue >= 0 ? "var(--emerald)" : "var(--red)" }}>
                      {a.totalRevenue >= 0 ? "+" : ""}₹{Math.abs(a.totalRevenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--red)" }}>
                      -{a.totalTransportEmissions.toFixed(2)} t
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--emerald)" }}>
                      +{a.totalDisplacedCredit.toFixed(2)} t
                    </td>
                    <td style={{
                      padding: "10px 14px", fontFamily: "var(--font-mono)", fontWeight: 700,
                      color: a.totalNetEmissionSaving >= 0 ? "var(--emerald)" : "var(--red)",
                    }}>
                      {a.totalNetEmissionSaving >= 0 ? "+" : ""}{a.totalNetEmissionSaving.toFixed(2)} t
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "var(--bg-raised)", fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: "10px 14px", color: "var(--text-primary)" }}>TOTAL</td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                    {solution.totalAllocated.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--emerald)" }}>
                    +₹{solution.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--red)" }}>
                    -{solution.emissionAudit.transportTotal.toFixed(2)} t
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--emerald)" }}>
                    +{solution.emissionAudit.displacedVirginTotal.toFixed(2)} t
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", color: "var(--emerald)", fontSize: 14 }}>
                    +{solution.totalNetEmissionSaving.toFixed(2)} t
                  </td>
                </tr>
              </tbody>
            </table>
          </SpotlightCard>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back to Optimizer
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onRestart}>
          <RefreshCw size={15} /> New Analysis
        </MagneticButton>
      </div>
    </div>
  );
}
