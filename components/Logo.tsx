import Image from 'next/image';

interface LogoProps {
  /** invert: use white lines + white text (for dark footer bg) */
  invert?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ invert = false, className = '', size = 'md' }: LogoProps) {
  const nameA  = invert ? '#ffffff' : '#0a0a0a';
  const nameB  = invert ? 'rgba(255,255,255,0.7)' : '#64748b';

  const dimensions = {
    sm: { width: 30, height: 26, text: 'text-xl' },
    md: { width: 40, height: 34, text: 'text-2xl lg:text-[1.65rem]' },
    lg: { width: 50, height: 43, text: 'text-3xl' },
  }[size];

  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      {/* Fox Tech Fox Icon Mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${invert ? 'filter invert' : ''}`}>
        <Image
          src="/foxi-tech-logo.svg"
          alt="Foxi Tech Logo"
          width={dimensions.width}
          height={dimensions.height}
          priority
          className="object-contain w-auto h-auto"
          style={{ height: `${dimensions.height}px`, width: 'auto' }}
        />
      </div>

      {/* Wordmark */}
      <span className={`font-display ${dimensions.text} font-bold tracking-tight leading-none`}>
        <span style={{ color: nameA }}>Foxi</span>
        <span style={{ color: nameB }}> Tech</span>
      </span>
    </div>
  );
}
