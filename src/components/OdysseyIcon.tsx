interface Props {
  size?: number
  /** 'mark' = three cards on transparent · 'icon' = cards on navy rounded bg (app icon style) */
  variant?: 'mark' | 'icon'
}

function Mark() {
  return (
    <>
      {/* Back card — tide blue, notes */}
      <g transform="translate(50 50) rotate(-22) translate(-50 -50)">
        <rect x="8" y="6" width="84" height="88" rx="9" fill="#2E6FA8" />
        <circle cx="20" cy="20" r="5" fill="#fff" fillOpacity="0.95" />
        <rect x="30" y="17" width="42" height="6" rx="3" fill="#fff" fillOpacity="0.95" />
        <rect x="14" y="34" width="64" height="5" rx="2.5" fill="#fff" fillOpacity="0.85" />
        <rect x="14" y="44" width="46" height="5" rx="2.5" fill="#fff" fillOpacity="0.55" />
        <rect x="14" y="56" width="64" height="5" rx="2.5" fill="#fff" fillOpacity="0.85" />
        <rect x="14" y="66" width="38" height="5" rx="2.5" fill="#fff" fillOpacity="0.55" />
        <rect x="14" y="78" width="52" height="5" rx="2.5" fill="#fff" fillOpacity="0.7" />
      </g>
      {/* Middle card — sand, route map */}
      <g transform="translate(50 50) rotate(-4) translate(-50 -50)">
        <rect x="6" y="8" width="88" height="84" rx="9" fill="#F3E9D5" />
        <g stroke="#0A1A2E" strokeWidth="0.8" strokeOpacity="0.22">
          <line x1="6" y1="28" x2="94" y2="28" />
          <line x1="6" y1="48" x2="94" y2="48" />
          <line x1="6" y1="68" x2="94" y2="68" />
          <line x1="28" y1="8" x2="28" y2="92" />
          <line x1="50" y1="8" x2="50" y2="92" />
          <line x1="72" y1="8" x2="72" y2="92" />
        </g>
        <path d="M 18 76 Q 36 60 50 50 Q 64 40 80 22" stroke="#0A1A2E" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="3.2 3.6" fill="none" />
        <circle cx="18" cy="76" r="4" fill="#0A1A2E" fillOpacity="0.9" />
        <path d="M 80 14 C 86 14 90 18 90 24 C 90 32 80 42 80 42 C 80 42 70 32 70 24 C 70 18 74 14 80 14 Z" fill="#E76A55" />
        <circle cx="80" cy="23" r="3" fill="#F3E9D5" />
      </g>
      {/* Front card — coral, boarding pass */}
      <g transform="translate(50 50) rotate(14) translate(-50 -50)">
        <rect x="8" y="10" width="84" height="84" rx="9" fill="#E76A55" />
        <rect x="8" y="10" width="84" height="22" fill="#F3E9D5" />
        <g transform="translate(50 21) rotate(-12)">
          <path d="M -16 -5 L 18 0 L -16 5 L -6 0 Z" fill="#E76A55" />
          <path d="M -6 0 L -16 5 L -1 0 Z" fill="#E76A55" fillOpacity="0.55" />
        </g>
        <circle cx="8" cy="50" r="4" fill="#0A1A2E" />
        <circle cx="92" cy="50" r="4" fill="#0A1A2E" />
        <line x1="14" y1="50" x2="86" y2="50" stroke="#F3E9D5" strokeWidth="1.2" strokeDasharray="2 2.5" strokeOpacity="0.65" />
        <rect x="20" y="58" width="20" height="5" rx="2.5" fill="#F3E9D5" fillOpacity="0.85" />
        <rect x="44" y="58" width="36" height="5" rx="2.5" fill="#F3E9D5" fillOpacity="0.55" />
        <rect x="20" y="70" width="44" height="5" rx="2.5" fill="#F3E9D5" fillOpacity="0.85" />
        <rect x="20" y="80" width="28" height="5" rx="2.5" fill="#F3E9D5" fillOpacity="0.55" />
        <rect x="54" y="80" width="20" height="5" rx="2.5" fill="#F3E9D5" fillOpacity="0.55" />
      </g>
    </>
  )
}

export function OdysseyIcon({ size = 32, variant = 'mark' }: Props) {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 1024 1024" width={size} height={size}>
        <rect width="1024" height="1024" rx="230" fill="#0A1A2E" />
        <g transform="translate(152 152) scale(7.2)">
          <Mark />
        </g>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <Mark />
    </svg>
  )
}
