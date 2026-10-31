'use client';

import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className = '', size = 32 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Continuous loop gradient from light blue -> royal blue -> iris -> violet */}
        <linearGradient id="blLoopGrad" x1="12" y1="12" x2="88" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="70%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <linearGradient id="blFoldGrad" x1="24" y1="45" x2="75" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
        </linearGradient>

        <filter id="blGlow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter="url(#blGlow)">
        {/* Main Ribbon B-Loop Structure */}
        <path
          d="M26 18C26 13.5 29.5 10 34 10H54C67.2 10 78 18.5 78 30.5C78 38.2 72.5 44.8 63.5 47.8C74 50.8 82 58.8 82 70.5C82 83 70.8 91 56 91H33C28 91 24 87 24 82V24C24 20.5 24.8 18 26 18Z"
          fill="url(#blLoopGrad)"
        />

        {/* Upper interior loop cutout */}
        <path
          d="M42 26H52C58 26 62.5 29.5 62.5 35C62.5 40.5 58 44 52 44H42V26Z"
          fill="#FFFFFF"
        />

        {/* Lower interior loop cutout */}
        <path
          d="M42 56H54C60.5 56 65.5 60 65.5 66.5C65.5 73 60.5 77 54 77H42V56Z"
          fill="#FFFFFF"
        />

        {/* Soft highlight fold on bottom ribbon */}
        <path
          d="M24 48C32 48 50 49 59 56C51 51 36 49.5 24 50V48Z"
          fill="#FFFFFF"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}

interface LogoProps {
  variant?: 'light' | 'dark' | 'white';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({
  variant = 'light',
  showTagline = true,
  size = 'md',
  className = '',
}: LogoProps) {
  // Sizes
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9.5px] tracking-[0.22em]',
    lg: 'text-[11px] tracking-[0.25em]',
  };

  // Text color styles based on variant
  const titleColor =
    variant === 'dark' || variant === 'white'
      ? 'text-white'
      : 'text-slate-900';

  const hubBadgeColor =
    variant === 'dark' || variant === 'white'
      ? 'text-[#818CF8]'
      : 'text-[#6366F1]';

  const taglineColor =
    variant === 'dark' || variant === 'white'
      ? 'text-slate-400'
      : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoIcon size={iconSizes[size]} className="shrink-0" />
      <div className="flex flex-col justify-center">
        <div className={`flex items-baseline font-extrabold tracking-tight ${titleSizes[size]} leading-none`}>
          <span className={titleColor}>Brightloop</span>
          <span className={`ml-1.5 font-bold ${hubBadgeColor}`}>Hub</span>
        </div>
        {showTagline && (
          <div className={`mt-1 font-semibold uppercase ${taglineColor} ${taglineSizes[size]} leading-none`}>
            MANAGE &bull; BILL &bull; GROW
          </div>
        )}
      </div>
    </div>
  );
}
