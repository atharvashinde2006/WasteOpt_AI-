// Step 4: AI/ML Suitability Engine
import { useState } from "react";
import { PATHWAYS } from "../../data/domain";
import { SpotlightCard, MagneticButton, SectionDivider } from "../ui/Primitives";
import { computeMLSuitability, getRadarData, PARAM_LABELS } from "../../engine/mlSuitability";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight, ArrowLeft, Brain, Cpu, TrendingUp } from "lucide-react";

const PATHWAY_META = {
  scm:          { label: "Cement / Concrete",   color: "#6366f1", icon: "🏗️" },
  geopolymer:   { label: "Geopolymer / Precast", color: "#8b5cf6", icon: "🧱" },
  road_base:    { label: "Road Construction",    color: "#f59e0b", icon: "🛣️" },
  mine_backfill:{ label: "Mine Backfill",        color: "#10b981", icon: "⛏️" },
};

const CONFIDENCE_CONFIG = {
  High:   { color: "#10b981", bg: "rgba(16,185,129,0.12)", bar: "#10b981" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  bar: "#f59e0b" },
  Low:    { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   bar: "#ef4444" },
};

function ScoreBar({ score, color }) {
  return (
    <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`,
        borderRadius: 4, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: `0 0 8px ${color}66`,
      }} />
    </div>
  );
}

function ScoreCard({ pathwayId, suitability, wasteParams, isSelected, onClick }) {
  const meta = PATHWAY_META[pathwayId];
  const conf = CONFIDENCE_CONFIG[suitability.confidence];
  const pathway = PATHWAYS[pathwayId];

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? `${meta.color}12` : "var(--bg-surface)",
        border: `1px solid ${isSelected ? meta.color + "50" : "var(--border)"}`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: "var(--radius-lg)", padding: "18px 20px",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: isSelected ? `0 0 24px ${meta.color}22` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, fontSize: 16,
            background: `${meta.color}22`, border: `1px solid ${meta.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{meta.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{meta.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Rank #{suitability.rank}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 30, fontWeight: 900, color: meta.color,
            fontFamily: "var(--font-mono)", lineHeight: 1,
          }}>{suitability.score}<span style={{ fontSize: 14 }}>%</span></div>
          <div style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
            background: conf.bg, color: conf.color, marginTop: 3, display: "inline-block",
          }}>{suitability.confidence} Confidence</div>
        </div>
      </div>

      <ScoreBar score={suitability.score} color={meta.color} />

      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {suitability.recommendation}
      </div>

      {suitability.topFeature && (
        <div style={{ marginTop: 8, fontSize: 10, color: meta.color, fontFamily: "var(--font-mono)" }}>
          ⚡ Key factor: {PARAM_LABELS[suitability.topFeature] || suitability.topFeature}
        </div>
      )}
    </div>
  );
}

function RadarPanel({ wasteParams, pathwayId }) {
  const data = getRadarData(wasteParams, pathwayId);
  const meta = PATHWAY_META[pathwayId] || { color: "#06b6d4" };

  if (!data.length) return null;

  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textAlign: "center" }}>
        Feature Importance Radar — {PATHWAY_META[pathwayId]?.label}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="param" tick={{ fill: "#64748b", fontSize: 10 }} />
          <Radar name="Score" dataKey="score" stroke={meta.color} fill={meta.color} fillOpacity={0.18} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: "#1a2438", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#f1f5f9" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MLSuitabilityStep({ wasteParams, complianceResults, onNext, onBack }) {
  const mlScores = computeMLSuitability(wasteParams);
  const [selectedPathway, setSelectedPathway] = useState(
    Object.values(mlScores).sort((a, b) => b.score - a.score)[0]?.pathwayId
  );

  const ranked = Object.values(mlScores).sort((a, b) => b.score - a.score);
  const topScore = ranked[0];

  return (
    <div className="anim-fade-up" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <Brain size={11} />
          Step 4 of 8 — AI/ML Suitability Engine
        </div>
        <h1>ML-Ranked Pathway Scores</h1>
        <p className="subtitle">
          XGBoost + Random Forest ensemble predicts and ranks reuse pathway suitability from
          chemical, physical and engineering feature vectors calibrated to IS/ASTM thresholds.
        </p>
      </div>

      {/* ML model info strip */}
      <div style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.06))",
        border: "1px solid rgba(139,92,246,0.2)", borderRadius: "var(--radius-lg)",
        padding: "16px 22px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        <Cpu size={28} color="#8b5cf6" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
            Model Architecture: XGBoost + Random Forest Ensemble
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Feature importance weighted scoring · 10-parameter input vector · Calibrated on IS 3812 / IRC:SP:58 / DGMS compliance boundaries
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Pathway</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: PATHWAY_META[topScore?.pathwayId]?.color }}>
            {PATHWAY_META[topScore?.pathwayId]?.label} — {topScore?.score}%
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>
        {/* Score cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SectionDivider label="Suitability Rankings" />
          {ranked.map(s => (
            <ScoreCard
              key={s.pathwayId}
              pathwayId={s.pathwayId}
              suitability={s}
              wasteParams={wasteParams}
              isSelected={selectedPathway === s.pathwayId}
              onClick={() => setSelectedPathway(s.pathwayId)}
            />
          ))}
        </div>

        {/* Radar panel */}
        <div style={{ position: "sticky", top: 80 }}>
          <SpotlightCard style={{ padding: "20px" }}>
            <SectionDivider label="Feature Analysis" />
            {selectedPathway && (
              <RadarPanel wasteParams={wasteParams} pathwayId={selectedPathway} />
            )}
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
              {mlScores[selectedPathway]?.modelNote}
            </div>
            <div style={{
              marginTop: 14, background: "var(--bg-raised)", borderRadius: 8,
              padding: "12px 14px", fontSize: 11,
            }}>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Feature Weights (XGBoost)</div>
              {selectedPathway && getRadarData(wasteParams, selectedPathway).map(d => (
                <div key={d.param} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 100, fontSize: 10, color: "var(--text-muted)" }}>{d.param}</div>
                  <div style={{ flex: 1, height: 4, background: "var(--bg-hover)", borderRadius: 2 }}>
                    <div style={{
                      height: "100%", width: `${d.score}%`, borderRadius: 2,
                      background: PATHWAY_META[selectedPathway]?.color,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-primary)", width: 28, textAlign: "right" }}>
                    {d.score}
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </MagneticButton>
        <MagneticButton className="btn btn-primary btn-lg" onClick={onNext}>
          View Market & Destinations <ArrowRight size={16} />
        </MagneticButton>
      </div>
    </div>
  );
}
