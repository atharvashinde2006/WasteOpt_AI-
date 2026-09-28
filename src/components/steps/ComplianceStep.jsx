import { useState } from 'react';
import { PATHWAYS } from '../../data/domain';
import { StatusBadge, MagneticButton, SectionDivider } from '../ui/Primitives';
import BorderGlow from '../ui/BorderGlow';
import { ArrowRight, ArrowLeft, CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react';

function ParamRow({ result }) {
  const colorMap = {
    pass: 'var(--emerald)',
    conditional: 'var(--amber)',
    fail: 'var(--red)',
  };
  const IconMap = {
    pass: <CheckCircle2 size={13} color="var(--emerald)" />,
    conditional: <AlertCircle size={13} color="var(--amber)" />,
    fail: <XCircle size={13} color="var(--red)" />,
  };

  return (
    <div className="compliance-row">
      <div className="compliance-param">
        {result.label}
        {result.astmRef && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
            {result.astmRef}
          </div>
        )}
      </div>
      <div className="compliance-value" style={{ color: colorMap[result.status] }}>
        {typeof result.value === 'number' ? result.value.toFixed(2) : result.value}
        {result.spec.unit && <span style={{ fontSize: 10, marginLeft: 2 }}>{result.spec.unit}</span>}
      </div>
      <div className="compliance-message">{result.message}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
        {IconMap[result.status]}
      </div>
    </div>
  );
}

function PathwayResult({ check, index }) {
  const [expanded, setExpanded] = useState(check.overallStatus !== 'fail');
  const pathway = PATHWAYS[check.pathwayId];
  const totalCriteria = check.results.length;
  const passCount = check.passCount;

  const statusClass = {
    pass: 'pass-card',
    conditional: 'conditional-card',
    fail: 'fail-card',
  }[check.overallStatus];

  const progressColor = {
    pass: 'var(--emerald)',
    conditional: 'var(--amber)',
    fail: 'var(--red)',
  }[check.overallStatus];

  return (
    <div
      className={`pathway-card ${statusClass} anim-fade-up`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="pathway-header">
        <div className="pathway-title">
          <div
            className="pathway-icon"
            style={{ background: `${pathway.color}22`, border: `1px solid ${pathway.color}44` }}
          >
            {pathway.icon}
          </div>
          <div>
            <div className="pathway-name">{pathway.name}</div>
            <div className="pathway-standard">{pathway.standard}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusBadge status={check.overallStatus} />
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <ChevronDown
              size={16}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>
        </div>
      </div>

      {/* Criteria summary bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: expanded ? 16 : 0 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(passCount / totalCriteria) * 100}%`,
            background: progressColor,
            borderRadius: 3,
            transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }} />
        </div>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {passCount}/{totalCriteria} passed
        </span>
      </div>

      {/* Economic data */}
      <div style={{ display: 'flex', gap: 20, marginBottom: expanded ? 16 : 0 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
            ₹{pathway.purchasePrice.toLocaleString('en-IN')}/t
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prep Cost</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
            ₹{pathway.prepCost.toLocaleString('en-IN')}/t
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Virgin Displaced</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
            {pathway.virginDisplacedPerTonne} tCO₂e/t
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Replaces</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {pathway.virginType}
          </div>
        </div>
      </div>

      {/* Expanded criteria table */}
      {expanded && (
        <div className="anim-fade-up" style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Criteria Detail
          </div>
          <div className="compliance-row" style={{
            fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--text-muted)', borderColor: 'transparent', padding: '4px 0 8px'
          }}>
            <div>Parameter / Standard</div>
            <div>Your Value</div>
            <div>Assessment</div>
            <div></div>
          </div>
          {check.results.map((r) => <ParamRow key={r.param} result={r} />)}
          {check.overallStatus === 'conditional' && (
            <div className="info-box amber" style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><strong>Note:</strong> {pathway.prepNote}</span>
            </div>
          )}
          {check.overallStatus === 'pass' && (
            <div className="info-box emerald" style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>All criteria met. This stream is eligible for <strong>{pathway.name}</strong> without pre-treatment.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComplianceStep({ complianceResults, onNext, onBack }) {
  const passCount = complianceResults.filter(c => c.overallStatus === 'pass').length;
  const condCount = complianceResults.filter(c => c.overallStatus === 'conditional').length;
  const failCount = complianceResults.filter(c => c.overallStatus === 'fail').length;
  const viableCount = passCount + condCount;

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <CheckCircle2 size={11} />
          Step 3 of 6 — Technical Compatibility Check
        </div>
        <h1>Pathway Eligibility Report</h1>
        <p className="subtitle">
          Each reuse pathway was evaluated against its governing ASTM/AASHTO standard using your waste stream's
          characterization data. Pre-treatment options are flagged where parameters are marginally non-compliant.
        </p>
      </div>

      {/* Summary tiles wrapped in BorderGlow */}
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
          padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
        }}>
          {[
            { label: 'Pathways Checked', value: complianceResults.length, sub: 'against engineering specs' },
            { label: 'Fully Compliant', value: passCount, sub: 'ready for offtake' },
            { label: 'Conditional', value: condCount, sub: 'requires minor blending' },
            { label: 'Not Suitable', value: failCount, sub: 'fails technical threshold' },
          ].map((s) => (
            <div key={s.label} className="stat-tile" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <div className="label">{s.label}</div>
              <div className="value" style={{ color: '#ffffff', fontSize: 22 }}>{s.value}</div>
              <div className="sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </BorderGlow>

      {/* Eligibility matrix banner in BorderGlow */}
      <BorderGlow
        borderRadius={12}
        glowRadius={28}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0a0a0a"
        glowColor="0 0 100"
        colors={['#ffffff', '#666666', '#1c1c1c']}
        className="w-full"
      >
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {viableCount > 0 ? (
            <>
              <CheckCircle2 size={18} style={{ color: '#ffffff', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#e5e5e5' }}>
                <strong style={{ color: '#ffffff' }}>{viableCount} viable pathway{viableCount > 1 ? 's' : ''} identified.</strong> Proceeding to market destination routing.
                {condCount > 0 && ` (${condCount} pathway${condCount > 1 ? 's' : ''} eligible with conditioning/screening)`}
              </div>
            </>
          ) : (
            <>
              <XCircle size={18} style={{ color: '#888888', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#a0a0a0' }}>
                No viable pathways identified with current parameters. Explore pre-treatment or revise composition.
              </div>
            </>
          )}
        </div>
      </BorderGlow>

      {/* Pathway cards */}
      <div>
        <SectionDivider label="Pathway-by-Pathway Compliance Detail" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complianceResults
            .sort((a, b) => {
              const order = { pass: 0, conditional: 1, fail: 2 };
              return order[a.overallStatus] - order[b.overallStatus];
            })
            .map((check, i) => (
              <PathwayResult key={check.pathwayId} check={check} index={i} />
            ))}
        </div>
      </div>

      {/* Methodology note */}
      <div className="info-box">
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)', fontSize: 12 }}>
          📋 Standards Applied
        </div>
        <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
          <li><strong>ASTM C618-22</strong> — Standard Specification for Coal Fly Ash and Raw or Calcined Natural Pozzolan for Use in Concrete</li>
          <li><strong>ASTM C989-22</strong> — Standard Specification for Slag Cement for Use in Concrete and Mortars</li>
          <li><strong>AASHTO M 145-91</strong> — Classification of Soils and Soil-Aggregate Mixtures for Highway Construction Purposes</li>
          <li><strong>ASTM D4609-08</strong> — Standard Guide for Evaluating Effectiveness of Admixtures for Soil Stabilization</li>
          <li><strong>EPA Method 1311 (TCLP)</strong> — Toxicity Characteristic Leaching Procedure</li>
        </ul>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <MagneticButton className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={15} />
          Back to Input
        </MagneticButton>
        <MagneticButton
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={viableCount === 0}
        >
          Explore Market Destinations
          <ArrowRight size={16} />
        </MagneticButton>
      </div>
    </div>
  );
}
