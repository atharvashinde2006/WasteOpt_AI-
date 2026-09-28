// Step 4: Market & Destination Engine
import { useState } from "react";
import { DESTINATIONS, PATHWAYS, EMISSION_FACTORS } from "../../data/domain";
import { MagneticButton, SectionDivider } from "../ui/Primitives";
import FlipCard from "../ui/FlipCard";
import BorderGlow from "../ui/BorderGlow";
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  Truck,
  Package,
  TrendingUp,
  ShieldCheck,
  FileText,
  Navigation,
  Compass
} from "lucide-react";

const TYPE_CONFIG = {
  scm:          { label: "SCM / Cement",    icon: "🏗️" },
  geopolymer:   { label: "Geopolymer",      icon: "🧱" },
  road_base:    { label: "Road Base",       icon: "🛣️" },
  mine_backfill:{ label: "Mine Backfill",   icon: "⛏️" },
  disposal:     { label: "Disposal (TSF)",  icon: "🗑️" },
};

// Radar layout geometry: polar angle and label positioning
const RADAR_LAYOUT = {
  landfill:         { angleDeg: -165, short: "Ash Pond TSF",  anchor: "end",   dx: -16, dy: 4 },
  highway_project:  { angleDeg: -130, short: "NH-48 NHAI",    anchor: "end",   dx: -16, dy: -4 },
  geopolymer_plant: { angleDeg: -45,  short: "GeoPrecast",    anchor: "start", dx: 16,  dy: -4 },
  cement_factory_a: { angleDeg: 12,   short: "Prism Cement",  anchor: "start", dx: 16,  dy: 4 },
  cement_factory_b: { angleDeg: 68,   short: "JK Cement",     anchor: "start", dx: 16,  dy: 12 },
  road_project_b:   { angleDeg: 135,  short: "State PWD",     anchor: "end",   dx: -16, dy: 14 },
  mine_site:        { angleDeg: 200,  short: "CIL Mine",      anchor: "end",   dx: -16, dy: 6 },
};

function DestFlipCard({ dest, complianceResults }) {
  const cfg = TYPE_CONFIG[dest.type] || TYPE_CONFIG.disposal;
  const compliance = complianceResults?.find(c => c.pathwayId === dest.type);
  const status = compliance?.overallStatus || (dest.type === "disposal" ? "disposal" : "fail");
  const pathway = PATHWAYS[dest.type];
  const freightCost = dest.distance * EMISSION_FACTORS.freight_rate_inr_per_tkm;
  const netPerTonne = dest.type === "disposal"
    ? -EMISSION_FACTORS.disposal_gate_fee
    : dest.purchasePrice - (pathway?.prepCost || 0) - freightCost;
  const isPositive = netPerTonne >= 0;

  const statusLabel = status === "pass" ? "Eligible" : status === "conditional" ? "Conditional" : status === "disposal" ? "Disposal" : "Not Eligible";

  const frontFace = (
    <div style={{
      padding: "20px", display: "flex", flexDirection: "column", height: "100%",
      boxSizing: "border-box", position: "relative",
    }}>
      {/* Subtle corner sheen */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 120, height: 120,
        background: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, fontSize: 18,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{cfg.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#ffffff" }}>{dest.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              <MapPin size={10} />{dest.location}
            </div>
            <div style={{ marginTop: 4 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                textTransform: "uppercase", letterSpacing: "0.06em",
                background: status === "pass" ? "rgba(255,255,255,0.15)" : status === "conditional" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                color: status === "pass" ? "#ffffff" : status === "conditional" ? "#d4d4d4" : "#888888",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>{statusLabel}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Net Margin</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800,
            color: isPositive ? "#ffffff" : "#888888",
          }}>
            {isPositive ? "+" : ""}₹{Math.abs(netPerTonne).toFixed(0)}
            <span style={{ fontSize: 10, marginLeft: 2, fontWeight: 400, color: "var(--text-muted)" }}>/t</span>
          </div>
        </div>
      </div>

      {/* Metrics 2x2 Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flex: 1, alignContent: "center" }}>
        {[
          { label: "Distance", value: `${dest.distance} km`, icon: <Truck size={10}/> },
          { label: "Capacity", value: `${dest.capacity.toLocaleString()} t/mo`, icon: <Package size={10}/> },
          { label: "Buy Price", value: `₹${Math.abs(dest.purchasePrice).toLocaleString()}/t`, icon: <TrendingUp size={10}/> },
          { label: "Pathway", value: cfg.label, icon: null },
        ].map(row => (
          <div key={row.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "8px 10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>
              {row.icon}{row.label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "#ffffff" }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* Bottom Hint */}
      <div style={{
        marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: "var(--text-muted)",
      }}>
        <span>Incoterms: DAP</span>
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
          <div style={{ fontWeight: 700, fontSize: 12, color: "#ffffff" }}>Logistics & Quality Specs</div>
        </div>
        <span style={{
          fontSize: 10, color: "var(--text-muted)", background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 12,
        }}>
          ↺ Return
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
        {/* Cost breakdown */}
        <div style={{
          background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: 8,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 4 }}>
            Net Unit Economics Breakdown
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
            <span style={{ color: "var(--text-muted)" }}>Gross Purchase Price:</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "#ffffff" }}>+₹{dest.purchasePrice}/t</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
            <span style={{ color: "var(--text-muted)" }}>Preparation & Conditioning:</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "#a0a0a0" }}>-₹{pathway?.prepCost || 0}/t</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
            <span style={{ color: "var(--text-muted)" }}>Freight ({dest.distance} km @ ₹2.8/tkm):</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "#a0a0a0" }}>-₹{freightCost.toFixed(0)}/t</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, borderTop: "1px solid var(--border)", paddingTop: 4, marginTop: 4 }}>
            <span style={{ color: "#ffffff" }}>Net Realization:</span>
            <span style={{ fontFamily: "var(--font-mono)", color: isPositive ? "#ffffff" : "#888888" }}>
              {isPositive ? "+" : ""}₹{netPerTonne.toFixed(0)}/t
            </span>
          </div>
        </div>

        {/* Contract specifications */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <ShieldCheck size={12} color="#ffffff" />
            <span>Offtake Guarantee: <strong>12-month rolling contract</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <FileText size={12} color="#ffffff" />
            <span>Testing Protocol: <strong>Batch certification via NABL lab</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
            <Truck size={12} color="#ffffff" />
            <span>Logistics: <strong>Pneumatic bulkers / Covered tippers</strong></span>
          </div>
        </div>

        <div style={{
          marginTop: "auto", fontSize: 10, color: "var(--text-muted)",
          borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 6,
          display: "flex", justifyContent: "space-between",
        }}>
          <span>Standard: {pathway?.standard || "Standard offtake"}</span>
          <span>Scope 3 credit: {pathway?.virginDisplacedPerTonne || 0} tCO₂/t</span>
        </div>
      </div>
    </div>
  );

  return (
    <FlipCard
      front={frontFace}
      back={backFace}
      width="100%"
      height={300}
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

export default function MarketDestinationStep({ wasteParams, complianceResults, onNext, onBack }) {
  const [activeDestId, setActiveDestId] = useState("highway_project");

  const eligiblePathways = complianceResults
    ? complianceResults.filter(c => c.overallStatus !== "fail").map(c => c.pathwayId)
    : ["scm", "geopolymer", "road_base", "mine_backfill"];

  const eligibleDests = DESTINATIONS.filter(
    d => d.type === "disposal" || eligiblePathways.includes(d.type)
  );

  const reuseDests = eligibleDests.filter(d => d.type !== "disposal");
  const disposal = eligibleDests.find(d => d.type === "disposal");

  const totalCapacity = reuseDests.reduce((s, d) => s + d.capacity, 0);
  const nearestDist = reuseDests.length > 0 ? Math.min(...reuseDests.map(d => d.distance)) : 0;

  // Unbiased demand coverage capped at 100%
  const demandCoveragePct = Math.min(
    Math.round((totalCapacity / (wasteParams.quantity || 1)) * 100),
    100
  );

  // Sorted destinations by distance
  const sortedDests = [...DESTINATIONS].sort((a, b) => a.distance - b.distance);
  const activeDest = DESTINATIONS.find(d => d.id === activeDestId) || sortedDests[0];
  const activeCompliance = complianceResults?.find(c => c.pathwayId === activeDest.type);
  const activeStatus = activeCompliance?.overallStatus || (activeDest.type === "disposal" ? "disposal" : "fail");

  // Center coordinates and geometry for the radial distance radar
  const cx = 430;
  const cy = 160;
  const rMin = 28;
  const rMax = 145;
  const dMax = 150; // max distance scale in km

  const getRadius = (dist) => rMin + (Math.min(dist, dMax) / dMax) * (rMax - rMin);

  return (
    <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <Truck size={11} />
          Step 4 of 6 — Market & Destination Engine
        </div>
        <h1>Buyer Network & Market Discovery</h1>
        <p className="subtitle">
          Find potential buyers and destinations based on location, capacity, and material demand.
          Flip each card to view net economics, DAP logistics specs, and NABL quality requirements.
        </p>
      </div>

      {/* KPI strip wrapped in BorderGlow */}
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
            { label: "Active Buyers", value: eligibleDests.length, unit: "destinations" },
            { label: "Total Capacity", value: totalCapacity.toLocaleString(), unit: "t/mo available" },
            { label: "Nearest Buyer", value: `${nearestDist} km`, unit: "road distance" },
            {
              label: "Demand Coverage",
              value: `${demandCoveragePct}%`,
              unit: demandCoveragePct >= 100 ? "100% supply absorbed" : "of supply absorbed"
            },
          ].map((s) => (
            <div key={s.label} className="stat-tile" style={{ background: "transparent", border: "none", padding: 0 }}>
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: "#ffffff", fontSize: 22 }}>{s.value}</div>
              <div className="sub">{s.unit}</div>
            </div>
          ))}
        </div>
      </BorderGlow>

      {/* Enhanced Logistics Distance Radar */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#080808"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ position: "relative", background: "#080808", overflow: "hidden", borderRadius: "inherit" }}>
          {/* Top Bar inside radar */}
          <div style={{
            padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Navigation size={13} style={{ color: "#ffffff" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff" }}>
                Logistics Haul Distance Radar
              </span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                · Concentric rings show true road distance (km) & freight corridors
              </span>
            </div>

            {/* Zone legend */}
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} /> &lt;50 km (Economic)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a0a0a0" }} /> 50–100 km (Regional)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#555555" }} /> &gt;100 km (Long Haul)
              </span>
            </div>
          </div>

          {/* Active destination detail HUD overlay */}
          {activeDest && (
            <div style={{
              position: "absolute", top: 52, right: 16, zIndex: 10,
              background: "rgba(14, 14, 14, 0.94)", border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(12px)",
              minWidth: 260, boxShadow: "0 8px 24px rgba(0,0,0,0.7)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#ffffff", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{TYPE_CONFIG[activeDest.type]?.icon}</span>
                  <span>{activeDest.name}</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 8,
                  textTransform: "uppercase",
                  background: activeStatus === "pass" ? "rgba(255,255,255,0.18)" : activeStatus === "conditional" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                  color: activeStatus === "pass" ? "#ffffff" : activeStatus === "conditional" ? "#d4d4d4" : "#888888",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}>
                  {activeStatus === "pass" ? "Eligible" : activeStatus === "conditional" ? "Conditional" : "Disposal"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 6 }}>
                <div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>HAUL DIST</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                    {activeDest.distance} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>FREIGHT (@₹2.8)</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                    ₹{Math.round(activeDest.distance * EMISSION_FACTORS.freight_rate_inr_per_tkm)}/t
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>CAPACITY</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                    {activeDest.capacity.toLocaleString()} t
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SVG Distance Radar Canvas */}
          <div style={{ position: "relative", height: 320, width: "100%" }}>
            <svg viewBox="0 0 860 320" width="100%" height="100%" style={{ display: "block" }}>
              <defs>
                <pattern id="radar-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                </pattern>
                <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="60%" stopColor="rgba(255,255,255,0.01)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              {/* Grid background */}
              <rect width="100%" height="100%" fill="url(#radar-grid)" />
              <circle cx={cx} cy={cy} r={rMax + 10} fill="url(#radar-glow)" />

              {/* Compass Axes */}
              <line x1={cx - rMax - 15} y1={cy} x2={cx + rMax + 15} y2={cy} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
              <line x1={cx} y1={cy - rMax - 15} x2={cx} y2={cy + rMax + 15} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />

              {/* Iso-Distance Concentric Circles */}
              {[
                { dist: 35,  label: "35 km" },
                { dist: 75,  label: "75 km" },
                { dist: 115, label: "115 km" },
                { dist: 150, label: "150 km max haul" },
              ].map(ring => {
                const r = getRadius(ring.dist);
                return (
                  <g key={ring.dist}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.10)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    {/* Ring label */}
                    <rect
                      x={cx - 38}
                      y={cy - r - 8}
                      width={76}
                      height={16}
                      rx={4}
                      fill="#080808"
                      stroke="rgba(255,255,255,0.12)"
                    />
                    <text
                      x={cx}
                      y={cy - r + 3}
                      textAnchor="middle"
                      fontSize={9}
                      fontFamily="var(--font-mono)"
                      fill="#888888"
                    >
                      {ring.label}
                    </text>
                  </g>
                );
              })}

              {/* Destination Vector Lines */}
              {DESTINATIONS.map(dest => {
                const layout = RADAR_LAYOUT[dest.id] || { angleDeg: 0, short: dest.name, anchor: "start", dx: 14, dy: 4 };
                const rad = (layout.angleDeg * Math.PI) / 180;
                const r = getRadius(dest.distance);
                const x = cx + r * Math.cos(rad);
                const y = cy + r * Math.sin(rad);

                const compliance = complianceResults?.find(c => c.pathwayId === dest.type);
                const eligible = eligibleDests.some(ed => ed.id === dest.id);
                const status = compliance?.overallStatus || (dest.type === "disposal" ? "disposal" : "fail");
                const isActive = activeDest?.id === dest.id;

                const strokeColor = isActive
                  ? "#ffffff"
                  : status === "pass"
                    ? "rgba(255,255,255,0.45)"
                    : status === "conditional"
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.10)";

                return (
                  <g
                    key={dest.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveDestId(dest.id)}
                    onMouseEnter={() => setActiveDestId(dest.id)}
                  >
                    {/* Line to center */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke={strokeColor}
                      strokeWidth={isActive ? 2.5 : eligible ? 1.5 : 1}
                      strokeDasharray={eligible && !isActive ? "none" : isActive ? "none" : "3 3"}
                    />

                    {/* Outer node glow when active */}
                    {isActive && (
                      <circle cx={x} cy={y} r={17} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.6} />
                    )}

                    {/* Node Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={11}
                      fill={isActive ? "#222222" : eligible ? "#161616" : "#0e0e0e"}
                      stroke={isActive ? "#ffffff" : eligible ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}
                      strokeWidth={isActive ? 2 : 1}
                    />
                    <text
                      x={x}
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11}
                    >
                      {TYPE_CONFIG[dest.type]?.icon}
                    </text>

                    {/* Distance Tag & Label Badge */}
                    <g transform={`translate(${x + layout.dx}, ${y + layout.dy})`}>
                      <text
                        x={0}
                        y={0}
                        textAnchor={layout.anchor}
                        fontSize={10}
                        fontWeight={isActive ? 700 : 500}
                        fill={isActive ? "#ffffff" : eligible ? "#cccccc" : "#777777"}
                      >
                        {layout.short}
                      </text>
                      <text
                        x={0}
                        y={12}
                        textAnchor={layout.anchor}
                        fontSize={9}
                        fontFamily="var(--font-mono)"
                        fontWeight={700}
                        fill={isActive ? "#ffffff" : eligible ? "#a0a0a0" : "#666666"}
                      >
                        {dest.distance} km
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Source Centroid (Center Hub) */}
              <circle cx={cx} cy={cy} r={28} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
              <circle cx={cx} cy={cy} r={18} fill="#141414" stroke="#ffffff" strokeWidth={2} />
              <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize={11}>🏭</text>
              <text x={cx} y={cy + 34} textAnchor="middle" fontSize={9} fill="#ffffff" fontWeight="700">SOURCE HUB</text>
              <text x={cx} y={cy + 45} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="#888888">
                {wasteParams.quantity?.toLocaleString()} t/mo
              </text>
            </svg>
          </div>

          {/* Logistics Distance Corridor sequence footer */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, overflowX: "auto",
            padding: "10px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(8px)"
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 10,
              color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
              whiteSpace: "nowrap", marginRight: 4
            }}>
              <Compass size={12} /> Distance Corridor:
            </div>
            {sortedDests.map(dest => {
              const compliance = complianceResults?.find(c => c.pathwayId === dest.type);
              const eligible = eligibleDests.some(ed => ed.id === dest.id);
              const isSelected = activeDest?.id === dest.id;
              const freight = Math.round(dest.distance * EMISSION_FACTORS.freight_rate_inr_per_tkm);

              return (
                <button
                  key={dest.id}
                  onClick={() => setActiveDestId(dest.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 8,
                    background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                    border: isSelected ? "1px solid #ffffff" : "1px solid rgba(255,255,255,0.08)",
                    color: isSelected ? "#ffffff" : eligible ? "#cccccc" : "#777777",
                    cursor: "pointer", transition: "all 0.15s ease",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11 }}>{TYPE_CONFIG[dest.type]?.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500 }}>
                    {dest.name.split(" ")[0]}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                    padding: "1px 5px", borderRadius: 4,
                    background: isSelected ? "#ffffff" : "rgba(255,255,255,0.1)",
                    color: isSelected ? "#000000" : "#ffffff",
                  }}>
                    {dest.distance} km
                  </span>
                  <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
                    ₹{freight}/t
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </BorderGlow>

      {/* Destination cards - 3D Flippable */}
      <div>
        <SectionDivider label="Active Buyer Destinations — 3D Flippable Cards" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {reuseDests.map(dest => (
            <DestFlipCard key={dest.id} dest={dest} complianceResults={complianceResults} />
          ))}
          {disposal && (
            <DestFlipCard key={disposal.id} dest={disposal} complianceResults={complianceResults} />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onNext}>
          Calculate Cost & Carbon <ArrowRight size={16} />
        </MagneticButton>
      </div>
    </div>
  );
}
