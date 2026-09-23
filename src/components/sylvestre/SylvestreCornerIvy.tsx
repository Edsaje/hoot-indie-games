import React from 'react';
import { SylvestreLeaf } from './SylvestreLeaf';

interface SylvestreCornerIvyProps {
  className?: string;
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const SylvestreCornerIvy: React.FC<SylvestreCornerIvyProps> = ({
  className = '',
  corner = 'top-right',
}) => {
  const isRight = corner === 'top-right' || corner === 'bottom-right';
  const isBottom = corner === 'bottom-left' || corner === 'bottom-right';

  return (
    <div
      className={`absolute ${
        isBottom ? 'bottom-0' : 'top-0'
      } ${
        isRight ? 'right-0' : 'left-0'
      } pointer-events-none z-10 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Corner bracket & vine strictly concentric with frame border-radius (R=24px) */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={`w-16 h-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] ${
          isRight ? '-scale-x-100' : ''
        } ${isBottom ? '-scale-y-100' : ''}`}
      >
        {/* Carved Moss & Forged Metal Corner Joint */}
        <path
          d="M 2 56 L 2 24 A 22 22 0 0 1 24 2 L 56 2"
          stroke="#064e3b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 2 56 L 2 24 A 22 22 0 0 1 24 2 L 56 2"
          stroke="#10b981"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Creeping Ivy Vine curled around the corner arc */}
        <path
          d="M 1 54 L 1 24 A 23 23 0 0 1 24 1 L 54 1"
          stroke="#047857"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 1 54 L 1 24 A 23 23 0 0 1 24 1 L 54 1"
          stroke="#34d399"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Tiny golden amber rivet / cabochon in corner */}
        <circle cx="8" cy="8" r="1.8" fill="#f59e0b" />
        <circle cx="8" cy="8" r="0.9" fill="#ffffff" opacity="0.85" />
      </svg>

      {/* Logical Ivy Leaves Hugging the Frame */}
      {/* Leaf 1 along the top horizontal border */}
      <div
        className="absolute pointer-events-none"
        style={{
          [isBottom ? 'bottom' : 'top']: -16,
          [isRight ? 'right' : 'left']: 32,
        }}
      >
        <SylvestreLeaf
          variant="emerald"
          size={14}
          rotation={isRight ? 15 : -15}
          flip={isRight}
        />
      </div>

      {/* Leaf 2 along the vertical border */}
      <div
        className="absolute pointer-events-none"
        style={{
          [isBottom ? 'bottom' : 'top']: 28,
          [isRight ? 'right' : 'left']: -4,
        }}
      >
        <SylvestreLeaf
          variant="moss"
          size={13}
          rotation={isRight ? 85 : -85}
          flip={isRight}
        />
      </div>

      {/* Small bud right at the apex corner */}
      <div
        className="absolute pointer-events-none"
        style={{
          [isBottom ? 'bottom' : 'top']: -6,
          [isRight ? 'right' : 'left']: 4,
        }}
      >
        <SylvestreLeaf
          variant="gold"
          size={11}
          rotation={isRight ? 45 : -45}
        />
      </div>
    </div>
  );
};
