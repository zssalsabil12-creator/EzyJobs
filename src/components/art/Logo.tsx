import { useId } from 'react';

export default function Logo({
  size = 40,
  glow = true,
  className = '',
}: {
  size?: number;
  glow?: boolean;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <span
      className={`brand-logo relative grid shrink-0 place-items-center ${className}`}
      style={{
        width: size,
        height: size,
        ['--logo-glow' as string]: glow ? '1' : '0',
      }}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className="relative z-10 overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="5" y1="6" x2="43" y2="42">
            <stop offset="0" stopColor="#2f64d6" />
            <stop offset="0.52" stopColor="#61a4ff" />
            <stop offset="1" stopColor="#2aa884" />
          </linearGradient>
          <linearGradient id={`${id}core`} x1="13" y1="10" x2="36" y2="38">
            <stop stopColor="#ffffff" stopOpacity=".96" />
            <stop offset="1" stopColor="#dce8ff" stopOpacity=".78" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="#10213f" />
        <path className="brand-logo__orbit" d="M8 27.5C11.5 15.2 23 8.6 34.7 13.1C42.1 16 43.5 24.8 39 31.3C34.6 37.8 23.1 41 14.2 35.2" stroke={`url(#${id}g)`} strokeWidth="2.1" strokeLinecap="round" />
        <path className="brand-logo__orbit brand-logo__orbit--rev" d="M9 17.4C17.2 8.7 31.4 8.7 38.2 17.5C43.2 24 39.9 34.2 31.2 37.8" stroke="rgba(255,255,255,.34)" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="2.5 4.5" />
        <path d="M14 29.5L19.5 24L24 28.5L34 18.5" stroke={`url(#${id}core)`} strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="brand-logo__pulse" cx="34" cy="18.5" r="2.3" fill="#61a4ff" />
        <path d="M15.5 34.8H32.5" stroke="rgba(255,255,255,.28)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="brand-logo__halo absolute inset-0 rounded-[28%]" />
      <span className="brand-logo__shine absolute inset-px rounded-[28%]" />
    </span>
  );
}
