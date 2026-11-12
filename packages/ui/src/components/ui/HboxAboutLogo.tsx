import { cn } from "@/components/lib/utils.js";

export function HboxAboutLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="118"
      height="118"
      fill="none"
      viewBox="0 0 512 512"
      className={cn("shrink-0 text-current", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hboxAboutBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
        <linearGradient id="hboxAboutH" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="50%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#c084fc" />
        </linearGradient>
        <linearGradient id="hboxAboutBorder" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="50%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect
        x="16"
        y="16"
        width="480"
        height="480"
        rx="108"
        fill="url(#hboxAboutBg)"
        stroke="url(#hboxAboutBorder)"
        strokeWidth="8"
      />
      <rect
        x="96"
        y="96"
        width="320"
        height="320"
        rx="48"
        fill="none"
        stroke="url(#hboxAboutBorder)"
        strokeWidth="12"
        opacity="0.6"
        strokeDasharray="180 40"
      />
      <g>
        <rect x="160" y="140" width="48" height="232" rx="24" fill="url(#hboxAboutH)" />
        <rect x="304" y="140" width="48" height="232" rx="24" fill="url(#hboxAboutH)" />
        <rect
          x="190"
          y="232"
          width="132"
          height="48"
          rx="16"
          fill="url(#hboxAboutH)"
          opacity="0.95"
        />
        <circle cx="210" cy="256" r="10" fill="#ffffff" />
        <circle cx="256" cy="256" r="14" fill="#06b6d4" />
        <circle cx="302" cy="256" r="10" fill="#ffffff" />
      </g>
    </svg>
  );
}
