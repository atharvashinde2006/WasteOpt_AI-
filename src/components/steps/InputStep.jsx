import { useState } from 'react';
import { WASTE_PRESETS } from '../../data/domain';
import { SpotlightCard, MagneticButton, SectionDivider } from '../ui/Primitives';
import BorderGlow from '../ui/BorderGlow';
import { ArrowRight, Factory, Thermometer, Droplets, FlaskConical, ChevronDown, Info } from 'lucide-react';

const PARAM_CONFIG = [
  {
    group: 'Quantity & Location',
    params: [
      { key: 'quantity', label: 'Monthly Quantity', unit: 't/mo', min: 100, max: 50000, step: 100, icon: '⚖️', description: 'Total tonnes generated per month at source' },
    ]
  },
  {
    group: 'Chemistry (Oxide Composition)',
    params: [
      { key: 'sio2_al2o3_fe2o3', label: 'SiO₂+Al₂O₃+Fe₂O₃', unit: '%', min: 20, max: 100, step: 0.5, icon: '⚗️', description: 'Sum of silica, alumina and iron oxide — key pozzolanic activity indicator (ASTM C618)' },
      { key: 'cao', label: 'CaO (Lime)', unit: '%', min: 0, max: 60, step: 0.5, icon: '🧪', description: 'Free calcium oxide — governs self-cementing (Class C) vs pozzolanic (Class F) behaviour' },
      { key: 'loi', label: 'Loss on Ignition', unit: '%', min: 0, max: 30, step: 0.1, icon: '🔥', description: 'Unburnt carbon residue — must be <6% for ASTM C618 SCM compliance' },
    ]
  },
  {
    group: 'Physical Properties',
    params: [
      { key: 'moisture', label: 'Moisture Content', unit: '%', min: 0, max: 40, step: 0.5, icon: '💧', description: 'Higher moisture increases drying costs and disqualifies some pathways' },
      { key: 'fineness45', label: 'Fineness (% ret. 45µm)', unit: '%', min: 0, max: 100, step: 1, icon: '📐', description: 'Coarser particles are less reactive — ASTM C618 requires <34% retained on 45µm' },
      { key: 'cbr', label: 'CBR', unit: '%', min: 1, max: 40, step: 0.5, icon: '🏗️', description: 'California Bearing Ratio — minimum 8% for road sub-base (AASHTO M 145)' },
      { key: 'pi', label: 'Plasticity Index', unit: '', min: 0, max: 30, step: 0.5, icon: '📊', description: 'Must be <6 (or non-plastic) for road base use. High PI indicates clayey, swelling-prone material' },
      { key: 'swelling', label: 'Swelling', unit: '%', min: 0, max: 5, step: 0.1, icon: '📈', description: 'Volume expansion after compaction — max 1.5% for road base (ASTM D5239)' },
    ]
  },
  {
    group: 'Geotechnical & Environmental',
    params: [
      { key: 'ucs_28d', label: 'UCS 28-day', unit: 'MPa', min: 0, max: 10, step: 0.1, icon: '💪', description: 'Unconfined Compressive Strength — min 0.5 MPa required for mine backfill (ASTM D2166)' },
      { key: 'tclp_pb', label: 'TCLP Lead (Pb)', unit: 'mg/L', min: 0, max: 10, step: 0.1, icon: '⚠️', description: 'Toxicity Characteristic Leaching Procedure — EPA limit 5 mg/L for non-hazardous classification' },
    ]
  }
];

export default function InputStep({ wasteParams, selectedPreset: selectedPresetProp, onParamsChange, onPresetChange, onNext }) {
  const [selectedPreset, setSelectedPreset] = useState(selectedPresetProp || 'fly_ash_class_f');
  const [expandedGroup, setExpandedGroup] = useState('Chemistry (Oxide Composition)');

  const applyPreset = (presetId) => {
    setSelectedPreset(presetId);
    onParamsChange({ ...WASTE_PRESETS[presetId].defaults });
    if (onPresetChange) onPresetChange(presetId);
  };

  const handleSliderChange = (key, value) => {
    onParamsChange({ ...wasteParams, [key]: parseFloat(value) });
  };

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="page-header">
        <div className="tag">
          <Factory size={11} />
          Step 1 of 6 — Waste Stream Input
        </div>
        <h1>Define Your Waste Stream</h1>
        <p className="subtitle">
          Select industry, waste type, quantity, location and material properties.
          All parameters map to IS/ASTM test standards used in pathway qualification.
        </p>
      </div>

      {/* Preset Selector wrapped in BorderGlow */}
      <BorderGlow
        borderRadius={16}
        glowRadius={36}
        glowIntensity={0.7}
        edgeSensitivity={30}
        coneSpread={26}
        backgroundColor="#0a0a0a"
        glowColor="0 0 100"
        colors={['#ffffff', '#777777', '#1a1a1a']}
        className="w-full"
      >
        <div style={{ padding: '20px 22px' }}>
          <SectionDivider label="Material Presets — Select Industrial Waste Stream" />
          <div className="preset-grid">
            {Object.values(WASTE_PRESETS).map((preset) => (
              <div
                key={preset.id}
                className={`preset-card ${selectedPreset === preset.id ? 'selected' : ''}`}
                onClick={() => applyPreset(preset.id)}
              >
                <div className="preset-icon">{preset.icon}</div>
                <div className="preset-name">
                  {preset.name}
                </div>
                <div className="preset-source">{preset.source}</div>
                <div className="preset-desc">{preset.description}</div>
              </div>
            ))}
          </div>
        </div>
      </BorderGlow>

      {/* Parameter Editor */}
      <div>
        <SectionDivider label="Fine-tune Parameters" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PARAM_CONFIG.map((group) => (
            <SpotlightCard key={group.group} style={{ overflow: 'visible' }}>
              {/* Accordion header */}
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 13 }}>{group.group}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{group.params.length} parameters</span>
                  <ChevronDown
                    size={16}
                    color="var(--text-muted)"
                    style={{
                      transform: expandedGroup === group.group ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              </button>

              {/* Accordion body */}
              {expandedGroup === group.group && (
                <div style={{
                  padding: '4px 20px 20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 20,
                  borderTop: '1px solid var(--border)',
                  paddingTop: 20,
                  marginTop: 0,
                }} className="anim-fade-up">
                  {group.params.map((p) => (
                    <div key={p.key} className="form-group">
                      <label className="form-label">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                          <button
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--text-muted)', padding: 0, display: 'inline-flex',
                            }}
                            title={p.description}
                          >
                            <Info size={11} />
                          </button>
                        </span>
                        <span className="value">
                          {(wasteParams[p.key] ?? p.min).toLocaleString('en-US', {
                            minimumFractionDigits: 0, maximumFractionDigits: 2
                          })} {p.unit}
                        </span>
                      </label>
                      <div className="slider-wrap">
                        <input
                          type="range"
                          className="slider"
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          value={wasteParams[p.key] ?? p.min}
                          onChange={(e) => handleSliderChange(p.key, e.target.value)}
                          style={{
                            background: `linear-gradient(to right, var(--emerald) ${((wasteParams[p.key] ?? p.min) - p.min) / (p.max - p.min) * 100}%, var(--bg-hover) 0%)`
                          }}
                        />
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: 10, color: 'var(--text-muted)', marginTop: 3
                        }}>
                          <span>{p.min}{p.unit}</span>
                          <span>{p.max}{p.unit}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      {/* Summary & Submit Action wrapped in BorderGlow */}
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
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Material</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff' }}>
                {WASTE_PRESETS[selectedPreset]?.name}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Quantity</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {wasteParams.quantity?.toLocaleString()} t/mo
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>LOI</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {wasteParams.loi} %
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Pozzolanic Oxides</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {wasteParams.sio2_al2o3_fe2o3} %
              </div>
            </div>
          </div>
          <MagneticButton className="btn btn-primary btn-lg" onClick={onNext}>
            Generate Material Profile
            <ArrowRight size={16} />
          </MagneticButton>
        </div>
      </BorderGlow>
    </div>
  );
}
