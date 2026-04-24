import type { SVGProps } from 'react';

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  variant?: 'full' | 'icon';
}

export default function CentaurLogo({ size = 28, variant = 'icon', ...props }: LogoProps) {
  return variant === 'icon' ? (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* 半人马剪影 + AI 星芒 */}
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#4f8cff" />
          <stop offset="100%" stopColor="#6ba0ff" />
        </linearGradient>
      </defs>
      {/* 圆底 */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logo-grad)" />
      {/* 半人马 (C) 抽象 — 弓与箭头符号 */}
      <path d="M10 22C10 18 14 16 16 14C18 12 20 10 20 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M14 20L20 8L23 10L17 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* AI 星芒 */}
      <circle cx="21.5" cy="8.5" r="1.2" fill="white" />
      <circle cx="23.5" cy="11" r="0.8" fill="white" opacity="0.7" />
      <circle cx="19" cy="6.5" r="0.6" fill="white" opacity="0.5" />
    </svg>
  ) : (
    <svg width={size * 3.5} height={size} viewBox="0 0 112 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="logo-grad2" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#4f8cff" />
          <stop offset="100%" stopColor="#6ba0ff" />
        </linearGradient>
      </defs>
      {/* 图标 */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logo-grad2)" />
      <path d="M10 22C10 18 14 16 16 14C18 12 20 10 20 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M14 20L20 8L23 10L17 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="21.5" cy="8.5" r="1.2" fill="white" />
      <circle cx="23.5" cy="11" r="0.8" fill="white" opacity="0.7" />
      {/* 文字 */}
      <text x="38" y="20" fontFamily="'Inter', system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#f2f4f8" letterSpacing="-0.3">半人马</text>
      <text x="38" y="29" fontFamily="'Inter', system-ui, sans-serif" fontSize="9" fontWeight="500" fill="#5c616a" letterSpacing="0.5">AI CRM</text>
    </svg>
  );
}
