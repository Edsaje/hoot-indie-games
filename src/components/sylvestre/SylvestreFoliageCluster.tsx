import React from 'react';
import { SylvestreLeaf } from './SylvestreLeaf';

interface SylvestreFoliageClusterProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top';
  size?: 'sm' | 'md' | 'lg';
}

export const SylvestreFoliageCluster: React.FC<SylvestreFoliageClusterProps> = ({
  className = '',
  position = 'top-left',
  size = 'md',
}) => {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1.0;

  const positionClasses = {
    'top-left': '-top-4 -left-3',
    'top-right': '-top-4 -right-3 -scale-x-100',
    'bottom-left': '-bottom-3 -left-3 -scale-y-100',
    'bottom-right': '-bottom-3 -right-3 -scale-x-100 -scale-y-100',
    'center-top': '-top-5 left-1/2 -translate-x-1/2',
  }[position];

  return (
    <div
      className={`absolute ${positionClasses} pointer-events-none z-20 select-none group-hover:scale-105 transition-transform duration-300 ${className}`}
      style={{ transform: `scale(${scale})` }}
      aria-hidden="true"
    >
      {/* Little wooden branch node */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="absolute top-2 left-2 w-6 h-6 text-[#5c3c26] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-10"
      >
        <path
          d="M4 28 Q14 20 18 14 Q24 6 28 2"
          stroke="#5c3c26"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M6 28 Q14 21 17 15"
          stroke="#8c5836"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2.5" fill="#3d281a" />
        <circle cx="16" cy="16" r="1.2" fill="#10b981" />
      </svg>

      {/* Primary prominent Emerald Leaf */}
      <div className="relative z-20">
        <SylvestreLeaf
          variant="emerald"
          cycle={1}
          delay={0.2}
          size={24}
          rotation={-35}
        />
      </div>

      {/* Secondary vibrant Moss Leaf */}
      <div className="absolute top-1 left-3.5 z-10">
        <SylvestreLeaf
          variant="moss"
          cycle={2}
          delay={1.5}
          size={20}
          rotation={15}
        />
      </div>

      {/* Small Ivy bud leaf */}
      <div className="absolute -top-2 left-2 z-10">
        <SylvestreLeaf
          variant="ivy"
          cycle={3}
          delay={3.0}
          size={16}
          rotation={-70}
        />
      </div>

      {/* Glowing spore / gold accent leaf */}
      <div className="absolute top-3 -left-2 z-10">
        <SylvestreLeaf
          variant="gold"
          cycle={1}
          delay={4.2}
          size={14}
          rotation={-110}
        />
      </div>
    </div>
  );
};
