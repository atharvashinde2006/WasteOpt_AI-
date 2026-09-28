// Step 2: Standardized Material Profile
// Converts raw input into a structured property profile with chemical,
// physical, engineering, and environmental property cards using interactive FlipCard and BorderGlow.

import { WASTE_PRESETS, PATHWAYS } from "../../data/domain";
import { MagneticButton, SectionDivider } from "../ui/Primitives";
import FlipCard from "../ui/FlipCard";
import BorderGlow from "../ui/BorderGlow";
import { ArrowRight, ArrowLeft, FlaskConical } from "lucide-react";

const PROPERTY_GROUPS = [
  {
    id: "chemical",
    label: "Chemical Properties",
    icon: "⚗️",
    color: "#ffffff",
    glowColor: "rgba(255,255,255,0.08)",
    standardRef: "IS 3812 (Part 1) / ASTM C618",
    standardSummary: "Oxide ratios & reactivity",
    targetSpec: "SiO₂+Al₂O₃+Fe₂O₃ ≥ 70%, LOI ≤ 5.0%, CaO ≤ 5.0%",
    engineeringRole: "Governs pozzolanic reactivity and hydraulic lime hydration. Low LOI ensures air-entraining stability in blended cement.",
    testMethod: "IS 1727:1967 X-Ray Fluorescence (XRF) & TGA",
    fields: [
      { key: "sio2_al2o3_fe2o3", label: "SiO₂+Al₂O₃+Fe₂O₃", unit: "%" },
      { key: "cao", label: "CaO", unit: "%" },
      { key: "loi", label: "Loss on Ignition", unit: "%" },
    ],
  },
  {
    id: "physical",
    label: "Physical Properties",
    icon: "📐",
    color: "#e5e5e5",
    glowColor: "rgba(255,255,255,0.08)",
    standardRef: "IS 3812 §5 & ASTM C618 Cl. 4.2",
    standardSummary: "Fineness & Moisture",
    targetSpec: "45µm residue ≤ 34%, Moisture ≤ 1.5%",
    engineeringRole: "Fineness determines packing density, water demand, and nucleation sites for C-S-H gel. Low moisture prevents silo agglomeration.",
    testMethod: "Wet sieving on 45µm IS sieve (IS 4031 Part 15)",
    fields: [
      { key: "moisture", label: "Moisture Content", unit: "%" },
      { key: "fineness45", label: "Fineness (45µm ret.)", unit: "%" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering Properties",
    icon: "🏗️",
    color: "#cccccc",
    glowColor: "rgba(255,255,255,0.08)",
    standardRef: "IRC:SP:58-2001 & DGMS 2008",
    standardSummary: "CBR, PI, Swell & UCS",
    targetSpec: "CBR ≥ 8%, PI ≤ 6 (Non-Plastic), UCS ≥ 0.5 MPa",
    engineeringRole: "Evaluates compaction behaviour for highway subgrades and underground stope backfill cohesion under seismic/rockburst conditions.",
    testMethod: "Proctor Compaction (IS 2720 Part 7) & UCS 28-day",
    fields: [
      { key: "cbr", label: "CBR", unit: "%" },
      { key: "pi", label: "Plasticity Index", unit: "" },
      { key: "swelling", label: "Swelling", unit: "%" },
      { key: "ucs_28d", label: "UCS 28-day", unit: "MPa" },
    ],
  },
  {
    id: "environmental",
    label: "Environmental Properties",
    icon: "🌿",
    color: "#b0b0b0",
    glowColor: "rgba(255,255,255,0.08)",
    standardRef: "CPCB HW Rules 2016 / EPA TCLP",
    standardSummary: "TCLP Leaching & Safety",
    targetSpec: "TCLP Pb < 5.0 mg/L (Non-Hazardous)",
    engineeringRole: "Leaching toxicity characterization ensures zero leachate contamination into groundwater when utilized in bulk unconfined fills.",
    testMethod: "EPA SW-846 Method 1311 / ICP-MS analysis",
    fields: [
      { key: "tclp_pb", label: "TCLP Lead (Pb)", unit: "mg/L" },
    ],
  },
];

function RadialGauge({ value, max, color = "#ffffff", size = 52 }) {
  const pct = Math.min(value / max, 1);
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

function PropertyFlipCard({ group, wasteParams }) {
  const maxMap = {
    sio2_al2o3_fe2o3: 100, cao: 60, loi: 30, moisture: 40,
    fineness45: 100, cbr: 40, pi: 30, swelling: 5, ucs_28d: 10, tclp_pb: 10
  };

  const frontFace = (
    <div style={{
      padding: "20px", display: "flex", flexDirection: "column", height: "100%",
      boxSizing: "border-box", position: "relative",
    }}>
      {/* Corner subtle radial glow */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 120, height: 120,
        background: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, fontSize: 16,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{group.icon}</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#ffffff" }}>{group.label}</div>
        </div>
        <span style={{
          fontSize: 10, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 12,
        }}>
          ↺ Flip
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
        {group.fields.map(({ key, label, unit }) => {
          const val = wasteParams[key] ?? 0;
          const maxVal = maxMap[key] || 100;

          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <RadialGauge value={val} max={maxVal} color={group.color} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: group.color }}>
                  {val.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  <span style={{ fontSize: 10, marginLeft: 3, color: "var(--text-muted)" }}>{unit}</span>
                </div>
                <div style={{ height: 3, background: "var(--bg-hover)", borderRadius: 2, marginTop: 4 }}>
                  <div style={{
                    height: "100%", borderRadius: 2, background: group.color,
                    width: `${Math.min((val / maxVal) * 100, 100)}%`,
                    transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "var(--text-muted)",
      }}>
        <span>{group.standardSummary}</span>
        <span>Click / drag to flip ↻</span>
      </div>
    </div>
  );

  const backFace = (
    <div style={{
      padding: "20px", display: "flex", flexDirection: "column", height: "100%",
      boxSizing: "border-box", position: "relative", background: "#0c0c0c",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>📋</span>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#ffffff" }}>{group.standardRef}</div>
        </div>
        <span style={{
          fontSize: 10, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 12,
        }}>
          ↺ Return
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 2 }}>
            Engineering Criteria & Threshold
          </div>
          <div style={{ color: "#ffffff", fontWeight: 600, fontSize: 12 }}>{group.targetSpec}</div>
        </div>

        <p style={{ margin: 0 }}>{group.engineeringRole}</p>

        <div style={{
          marginTop: "auto", fontSize: 10, color: "var(--text-muted)",
          borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8,
        }}>
          Standard Test Method: <strong style={{ color: "#ffffff" }}>{group.testMethod}</strong>
        </div>
      </div>
    </div>
  );

  return (
    <FlipCard
      front={frontFace}
      back={backFace}
      width="100%"
      height={350}
      radius={16}
      background="#111111"
      color="#ffffff"
      shadow
      shadowColor="#000000"
      shadowOpacity={0.6}
      tilt
      tiltMax={10}
      glare
      glareOpacity={0.16}
      hoverScale={1.02}
      perspective={1000}
    />
  );
}

export default function MaterialProfileStep({ wasteParams, selectedPreset, onNext, onBack }) {
  const preset = WASTE_PRESETS[selectedPreset];

  const eligiblePathways = Object.values(PATHWAYS).filter(p => {
    const crit = p.criteria;
    const checks = Object.entries(crit).map(([k, spec]) => {
      const v = wasteParams[k];
      if (v === undefined) return true;
      if (spec.max !== undefined && v > spec.max * 1.25) return false;
      if (spec.min !== undefined && v < spec.min * 0.75) return false;
      return true;
    });
    return checks.every(Boolean);
  });

  return (
    <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <FlaskConical size={11} />
          Step 2 of 6 — Standardized Material Profile
        </div>
        <h1>Material Property Profile</h1>
        <p className="subtitle">
          Raw input converted to a structured, standards-referenced material property profile.
          Flip each card to inspect governing ASTM & BIS engineering specifications and test methods.
        </p>
      </div>

      {/* Material identity strip wrapped in BorderGlow */}
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
        <div style={{
          padding: "20px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 36 }}>{preset?.icon}</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>{preset?.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{preset?.source}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{preset?.description}</div>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>Monthly Quantity</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "#ffffff" }}>
                {wasteParams.quantity?.toLocaleString()}
                <span style={{ fontSize: 12, marginLeft: 4, color: "var(--text-muted)" }}>t/mo</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 4 }}>Eligible Pathways</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "#ffffff" }}>
                {eligiblePathways.length}
                <span style={{ fontSize: 12, marginLeft: 4, color: "var(--text-muted)" }}>/ {Object.keys(PATHWAYS).length}</span>
              </div>
            </div>
          </div>
        </div>
      </BorderGlow>

      {/* Property cards grid */}
      <div>
        <SectionDivider label="Structured Property Profile — 3D Flippable Cards" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {PROPERTY_GROUPS.map(group => (
            <PropertyFlipCard key={group.id} group={group} wasteParams={wasteParams} />
          ))}
        </div>
      </div>

      {/* Standards mapping wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={32}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0e0e0e"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ padding: "20px 24px" }}>
          <SectionDivider label="Governing Indian & International Standards" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { std: "IS 3812:2003 (Part 1)", scope: "SiO₂+Al₂O₃+Fe₂O₃, LOI, Fineness, Moisture — SCM use in concrete", icon: "📋" },
              { std: "IRC:SP:58-2001", scope: "CBR, Plasticity Index, Swelling — road embankment fill", icon: "🛣️" },
              { std: "DGMS Circular 2008", scope: "UCS 28-day — mine backfill strength requirement", icon: "⛏️" },
              { std: "CPCB HW Rules 2016", scope: "TCLP Lead (Pb) — non-hazardous classification gate", icon: "🌿" },
            ].map(s => (
              <div key={s.std} style={{
                background: "var(--bg-raised)", borderRadius: "var(--radius-md)",
                padding: "12px 14px", border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span>{s.icon}</span>
                  <div style={{ fontWeight: 600, fontSize: 11, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{s.std}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.scope}</div>
              </div>
            ))}
          </div>
        </div>
      </BorderGlow>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onNext}>
          Run Compatibility Check <ArrowRight size={16} />
        </MagneticButton>
      </div>
    </div>
  );
}
