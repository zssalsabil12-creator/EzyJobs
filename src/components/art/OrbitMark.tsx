import { useId } from 'react';

/** علامة مدارية نابضة: حلقتان متعاكستا الدوران ونواة تتنفس — حركة دائمة راقية */
export default function OrbitMark({
  size = 52,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8c97a" />
          <stop offset="0.55" stopColor="#f2ede4" />
          <stop offset="1" stopColor="#e0a58c" />
        </linearGradient>
      </defs>
      <g
        className="anim-rotate-slower"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="24" cy="24" r="20" stroke={`url(#${id}g)`} strokeWidth="1.4" strokeDasharray="6 7" strokeLinecap="round" opacity="0.9" />
      </g>
      <g
        className="anim-rotate-rev"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <ellipse cx="24" cy="24" rx="13" ry="13" stroke="#e0a58c" strokeWidth="1" strokeDasharray="3 5" strokeLinecap="round" opacity="0.55" />
      </g>
      <circle cx="24" cy="24" r="4.5" fill={`url(#${id}g)`}>
        <animate attributeName="r" values="4.5;6;4.5" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.65;1" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
