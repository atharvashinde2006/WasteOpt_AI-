import { useMagnetic } from '../../hooks/useAnimations';

export function MagneticButton({ children, className = '', onClick, disabled, ...props }) {
  const ref = useMagnetic(0.25);
  return (
    <button
      ref={ref}
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{ display: 'inline-flex', alignItems: 'center', willChange: 'transform' }}
      {...props}
    >
      {children}
    </button>
  );
}

export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, color }) {
  // Direct render with CSS animation via data attribute trick
  return (
    <span
      className="animated-val"
      style={{ color, fontVariantNumeric: 'tabular-nums' }}
    >
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) : value}{suffix}
    </span>
  );
}

export function SpotlightCard({ children, className = '', style }) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      style={style}
    >
      {children}
    </div>
  );
}

export function TiltCard({ children, className = '', style, maxTilt = 6 }) {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.transform = `perspective(600px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg)`;
    e.currentTarget.style.transition = 'none';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
    e.currentTarget.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  };

  return (
    <div
      className={className}
      style={{ willChange: 'transform', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pass:        { cls: 'badge-pass',        label: '✓ Compliant', },
    conditional: { cls: 'badge-conditional', label: '◎ Conditional' },
    fail:        { cls: 'badge-fail',        label: '✗ Fails Spec' },
  };
  const { cls, label } = map[status] || map.fail;
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function ProgressBar({ value, max, color = 'var(--emerald)' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="progress-bar-wrap">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function Tooltip({ content, children }) {
  return (
    <div className="tooltip-wrap">
      {children}
      <div className="tooltip">{content}</div>
    </div>
  );
}

export function SectionDivider({ label }) {
  return <div className="section-label">{label}</div>;
}
