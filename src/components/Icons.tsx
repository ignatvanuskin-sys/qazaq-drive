type IconProps = { className?: string; size?: number };

const base = (size = 18) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export const ArrowRight = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ArrowUpRight = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const Check = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export const Phone = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2L21 14.5v3a2.5 2.5 0 0 1-2.7 2.5A17 17 0 0 1 3.5 5.7 2.5 2.5 0 0 1 6 3Z" />
  </svg>
);

export const WhatsApp = ({ className, size }: IconProps) => (
  <svg
    width={size ?? 18}
    height={size ?? 18}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable="false"
    className={className}
  >
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.53 3.68 1.46 5.2L2 22l5.1-1.6a9.9 9.9 0 0 0 4.94 1.3h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.97.98-3.02-.2-.31a8.16 8.16 0 0 1-1.25-4.42 8.18 8.18 0 1 1 8.05 8.1Zm4.5-6.1c-.25-.13-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12-.16.25-.64.8-.79.96-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-1.97-1.22 7.4 7.4 0 0 1-1.36-1.7c-.14-.24-.02-.38.11-.5.11-.12.25-.3.37-.44.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.3-.22.25-.84.83-.84 2s.86 2.31.98 2.47c.12.16 1.7 2.6 4.12 3.64.58.25 1.02.4 1.37.51.58.19 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.29Z" />
  </svg>
);

export const Instagram = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const MapPin = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const Clock = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const Mail = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

export const Close = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronDown = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const Menu = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Chat = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M21 12a8 8 0 0 1-8 8H8l-4.5 2 1.2-4.2A8 8 0 0 1 12 4a8 8 0 0 1 9 8Z" />
    <path d="M8.5 11h7M8.5 14.5h4" />
  </svg>
);

export const Send = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 12 20 4l-6 16-3.2-6.4L4 12Z" />
  </svg>
);

export const Star = ({ className, size }: IconProps) => (
  <svg
    width={size ?? 14}
    height={size ?? 14}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable="false"
    className={className}
  >
    <path d="m12 2.6 2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.8l-5.9 3.1 1.2-6.6L2.5 9.6l6.6-.9L12 2.6Z" />
  </svg>
);

export const Car = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 16v-3.2L6 8h12l2 4.8V16" />
    <path d="M3.5 16h17M6 16v2M18 16v2" />
    <circle cx="7.5" cy="16" r="0.6" fill="currentColor" />
    <circle cx="16.5" cy="16" r="0.6" fill="currentColor" />
  </svg>
);

export const Route = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18h4a3.5 3.5 0 0 0 0-7h-1a3.5 3.5 0 0 1 0-7h4" />
  </svg>
);

export const Shield = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l7 2.5v6c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5v-6L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const PlayCircle = ({ className, size }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m10 8.5 6 3.5-6 3.5v-7Z" />
  </svg>
);

export const Spinner = ({ className }: IconProps) => (
  <svg
    className={`animate-spin ${className ?? ""}`}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
