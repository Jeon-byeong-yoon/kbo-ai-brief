import React from 'react';

/**
 * 화면에 쓰는 아이콘은 전부 여기 선형 SVG 로 둔다.
 * 이전에는 ⚾🏆⭐🔮📊 같은 이모지를 직접 박아 썼는데, 플랫폼마다 모양·크기·색이
 * 제각각이라 정렬이 맞지 않고 테마 색을 따라가지도 않았다.
 */

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none' as const,
  className,
  'aria-hidden': true,
});

export const BallIcon = ({ size = 22, className, strokeWidth = 1.5 }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M6.2 5.1c1.9 1.8 3 4.2 3 6.9s-1.1 5.1-3 6.9" />
    <path d="M17.8 5.1c-1.9 1.8-3 4.2-3 6.9s1.1 5.1 3 6.9" />
  </svg>
);

export const SunIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size, className)} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <circle cx="10" cy="10" r="3.4" />
    <path d="M10 1.8v1.8M10 16.4v1.8M18.2 10h-1.8M3.6 10H1.8M15.8 4.2l-1.3 1.3M5.5 14.5l-1.3 1.3M15.8 15.8l-1.3-1.3M5.5 5.5 4.2 4.2" />
  </svg>
);

export const MoonIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size, className)} stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.6 12.3A6.9 6.9 0 0 1 7.7 3.4a6.9 6.9 0 1 0 8.9 8.9Z" />
  </svg>
);

export const ChevronDownIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
  </svg>
);

export const ArrowRightIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
  </svg>
);

export const SparkIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" fill="currentColor" stroke="none">
    <path d="M8 .9 9.3 5.4 13.8 6.7 9.3 8 8 12.5 6.7 8 2.2 6.7 6.7 5.4Z" />
    <path d="M13.2 10.4l.5 1.7 1.7.5-1.7.5-.5 1.7-.5-1.7-1.7-.5 1.7-.5Z" />
  </svg>
);

export const StarIcon = ({ size = 12, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" fill="currentColor" stroke="none">
    <path d="m8 1.8 1.85 3.9 4.15.6-3 3 .71 4.3L8 11.55 4.29 13.6 5 9.3l-3-3 4.15-.6Z" />
  </svg>
);

export const SearchIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
    <circle cx="7.2" cy="7.2" r="4.4" />
    <path d="m10.6 10.6 3 3" />
  </svg>
);

export const CloseIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
);

export const TrophyIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 2h7v3.2a3.5 3.5 0 0 1-7 0Z" />
    <path d="M4.5 3.2H2.8v1a2.2 2.2 0 0 0 1.9 2.1M11.5 3.2h1.7v1a2.2 2.2 0 0 1-1.9 2.1" />
    <path d="M8 8.7V11M5.8 14h4.4M6.6 11h2.8l.5 3H6.1Z" />
  </svg>
);

export const ChartIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 13.5h11" />
    <path d="M4.8 13.5V8.2M8 13.5V3.5M11.2 13.5V6.4" />
  </svg>
);

export const HistoryIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size, className)} viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.6 8a5.4 5.4 0 1 0 1.7-3.9" />
    <path d="M2.3 2.9v2.6h2.6M8 5.2V8l1.9 1.2" />
  </svg>
);
