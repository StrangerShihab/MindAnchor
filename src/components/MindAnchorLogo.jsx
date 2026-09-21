import React from 'react';

/**
 * MindAnchorLogo - Minimal, modern, dynamically animated Focus Engine anchor logo
 * Features:
 * - Rounded squircle container with warm orange gradient (#FF6B00 -> #FF8800)
 * - Gentle pulsing breathing glow & subtle floating animation
 * - Glowing orbital focus ring with orbiting particle accent
 * - Crisp, sharp, geometrically balanced white anchor
 */
export default function MindAnchorLogo({ className = '', size = 'md' }) {
  // Size presets for versatile usage
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14',
  }[size] || size;

  return (
    <div
      title="MindAnchor Deep Work Engine"
      className={`relative select-none cursor-pointer group flex items-center justify-center rounded-[14px] p-1.5 transition-transform duration-300 hover:scale-105 active:scale-95 animate-logo-pulse ${sizeClasses} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8800 100%)',
      }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
      >
        <defs>
          {/* Subtle particle glow */}
          <filter id="anchorParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for orbital trail */}
          <linearGradient id="orbitRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Subtle Static Outer Guide Ring */}
        <circle
          cx="18"
          cy="18"
          r="15.8"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="0.8"
          strokeDasharray="2 4"
          fill="none"
        />

        {/* 2. Dynamically Rotating Focus Engine Orbital Accent */}
        <g className="animate-logo-orbit" style={{ transformOrigin: '18px 18px' }}>
          <circle
            cx="18"
            cy="18"
            r="15.8"
            stroke="url(#orbitRingGrad)"
            strokeWidth="1.2"
            strokeDasharray="6 14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Orbiting Particle */}
          <circle
            cx="18"
            cy="2.2"
            r="1.4"
            fill="#FFFFFF"
            filter="url(#anchorParticleGlow)"
          />
        </g>

        {/* 3. Crisp Minimal Anchor Icon */}
        <g id="anchor-symbol">
          {/* Ring / Eye at top */}
          <circle
            cx="18"
            cy="9"
            r="2.8"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            fill="none"
          />

          {/* Vertical Shank */}
          <line
            x1="18"
            y1="11.8"
            x2="18"
            y2="27.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Horizontal Stock / Crossbar */}
          <line
            x1="12"
            y1="15"
            x2="24"
            y2="15"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Upward Curving Arms / Flukes */}
          <path
            d="M 9 21 C 9 26.6, 13.5 28.5, 18 28.5 C 22.5 28.5, 27 26.6, 27 21"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Fluke Tip (Pointing Upwards) */}
          <polyline
            points="7.4,22.8 9,20.2 10.6,22.8"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />

          {/* Right Fluke Tip (Pointing Upwards) */}
          <polyline
            points="25.4,22.8 27,20.2 28.6,22.8"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
}
