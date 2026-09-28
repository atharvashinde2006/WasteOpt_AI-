import { useState, useCallback } from 'react';
import './index.css';
import { WASTE_PRESETS } from './data/domain';
import { runAllComplianceChecks } from './engine/solver';
import JellyRadio from './components/ui/JellyRadio';

// Steps (6-step flow — removed ML Rank and Decision Dashboard)
import InputStep from './components/steps/InputStep';
import MaterialProfileStep from './components/steps/MaterialProfileStep';
import ComplianceStep from './components/steps/ComplianceStep';
import MarketDestinationStep from './components/steps/MarketDestinationStep';
import CostCarbonStep from './components/steps/CostCarbonStep';
import AllocationStep from './components/steps/AllocationStep';

const NAV_ITEMS = [
  { value: '0', label: 'Characterize' },
  { value: '1', label: 'Material Profile' },
  { value: '2', label: 'Compatibility' },
  { value: '3', label: 'Market' },
  { value: '4', label: 'Cost & Carbon' },
  { value: '5', label: 'Optimize' },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('fly_ash_class_f');
  const [wasteParams, setWasteParams] = useState({ ...WASTE_PRESETS.fly_ash_class_f.defaults });
  const [complianceResults, setComplianceResults] = useState(null);
  const [solution, setSolution] = useState(null);
  // Track max step reached so JellyRadio only allows backward navigation
  const [maxStep, setMaxStep] = useState(0);

  const goTo = (s) => {
    setStep(s);
    if (s > maxStep) setMaxStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleParamsChange = useCallback((params) => setWasteParams(params), []);
  const handlePresetChange = useCallback((presetId) => setSelectedPreset(presetId), []);

  const handleFromInput = useCallback(() => {
    const results = runAllComplianceChecks(wasteParams);
    setComplianceResults(results);
    goTo(1);
  }, [wasteParams]);

  // JellyRadio onChange — only allow navigation to already-visited steps
  const handleNavChange = (value, idx) => {
    if (idx <= maxStep) goTo(idx);
  };

  return (
    <div className="app-shell">
      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon" style={{ fontSize: 14, color: '#000' }}>♻</div>
          <span>WasteOpt</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>
            Valorization Platform
          </span>
        </div>

        {/* JellyRadio replaces old step buttons */}
        <JellyRadio
          items={NAV_ITEMS.map((it, i) => ({
            value: it.value,
            label: it.label,
            disabled: i > maxStep,
          }))}
          value={String(step)}
          onChange={handleNavChange}
          chipColor="#1a1a1a"
          activeColor="#ffffff"
          textColor="#555555"
          activeTextColor="#000000"
          size="sm"
          gap={4}
          radius={14}
          swell={0.15}
          barge={4}
          bounce={0.28}
          stiffness={500}
          ariaLabel="Navigation steps"
        />

        <div style={{
          fontSize: 10, color: 'var(--text-muted)',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          padding: '4px 10px', borderRadius: 6, fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          IS 3812 · IRC:SP:58 · DGMS
        </div>
      </nav>

      {/* Progress bar */}
      <div style={{ height: 1, background: 'var(--bg-surface)', position: 'sticky', top: 60, zIndex: 99 }}>
        <div style={{
          height: '100%',
          width: `${((step + 1) / 6) * 100}%`,
          background: '#ffffff',
          transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          opacity: 0.3,
        }} />
      </div>

      {/* Ambient noise bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 10% 0%, rgba(255,255,255,0.015) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 5%, rgba(255,255,255,0.01) 0%, transparent 50%)
        `,
      }} />

      {/* Main */}
      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {step === 0 && (
          <InputStep
            wasteParams={wasteParams}
            selectedPreset={selectedPreset}
            onParamsChange={handleParamsChange}
            onPresetChange={handlePresetChange}
            onNext={handleFromInput}
          />
        )}
        {step === 1 && (
          <MaterialProfileStep
            wasteParams={wasteParams}
            selectedPreset={selectedPreset}
            onNext={() => goTo(2)}
            onBack={() => goTo(0)}
          />
        )}
        {step === 2 && complianceResults && (
          <ComplianceStep
            complianceResults={complianceResults}
            onNext={() => goTo(3)}
            onBack={() => goTo(1)}
          />
        )}
        {step === 3 && complianceResults && (
          <MarketDestinationStep
            wasteParams={wasteParams}
            complianceResults={complianceResults}
            onNext={() => goTo(4)}
            onBack={() => goTo(2)}
          />
        )}
        {step === 4 && complianceResults && (
          <CostCarbonStep
            wasteParams={wasteParams}
            complianceResults={complianceResults}
            solution={solution}
            onNext={() => goTo(5)}
            onBack={() => goTo(3)}
          />
        )}
        {step === 5 && complianceResults && (
          <AllocationStep
            wasteParams={wasteParams}
            complianceResults={complianceResults}
            onSolutionReady={(sol) => setSolution(sol)}
            onNext={() => {
              // Restart from beginning
              setStep(0);
              setMaxStep(0);
              setWasteParams({ ...WASTE_PRESETS.fly_ash_class_f.defaults });
              setSelectedPreset('fly_ash_class_f');
              setComplianceResults(null);
              setSolution(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={() => goTo(4)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 10, color: 'var(--text-muted)',
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span>WasteOpt — 6-Step Industrial Waste Valorization Platform · ISO 14044 Cut-Off · GHG Protocol Scope 3</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>IS 3812:2003 · IRC:SP:58 · DGMS 2008 · CEA India 2024</span>
      </footer>
    </div>
  );
}
