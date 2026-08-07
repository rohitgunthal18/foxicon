interface LogoProps {
  /** invert: use white lines + white text (for dark footer bg) */
  invert?: boolean;
}

export default function Logo({ invert = false }: LogoProps) {
  const line   = invert ? '#ffffff' : '#0a0a0a';
  const border = invert ? 'rgba(255,255,255,0.35)' : '#0a0a0a';
  const nameA  = invert ? '#ffffff' : '#0a0a0a';
  const nameB  = invert ? 'rgba(255,255,255,0.45)' : '#9ca3af';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon mark */}
      <svg
        width="44"
        height="32"
        viewBox="0 0 44 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Narrow border box */}
        <rect x="0.5" y="0.5" width="43" height="31" stroke={border} strokeWidth="1" />

        {/* 5 parallel "/" diagonal lines — middle longest, taper to shorter at edges */}
        {/* All share same direction vector (6, -11); centered vertically at y=16 */}

        {/* Line 1 — leftmost, shortest */}
        <line x1="7"    y1="21.5" x2="13"   y2="10.5" stroke={line} strokeWidth="1.5" strokeLinecap="square" />
        {/* Line 2 — medium */}
        <line x1="11.5" y1="24.5" x2="20.5" y2="7.5"  stroke={line} strokeWidth="1.5" strokeLinecap="square" />
        {/* Line 3 — middle, longest */}
        <line x1="16"   y1="27"   x2="28"   y2="5"     stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="square" />
        {/* Line 4 — medium */}
        <line x1="23.5" y1="24.5" x2="32.5" y2="7.5"  stroke={line} strokeWidth="1.5" strokeLinecap="square" />
        {/* Line 5 — rightmost, shortest */}
        <line x1="31"   y1="21.5" x2="37"   y2="10.5" stroke={line} strokeWidth="1.5" strokeLinecap="square" />
      </svg>

      {/* Wordmark */}
      <span className="font-display text-xl font-bold tracking-tight leading-none">
        <span style={{ color: nameA }}>FOXI</span>
        <span style={{ color: nameB }}> TECH</span>
      </span>
    </div>
  );
}
