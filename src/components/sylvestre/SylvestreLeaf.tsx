import React from 'react';

export type LeafVariant = 'emerald' | 'moss' | 'gold' | 'amber' | 'ivy';

interface SylvestreLeafProps {
  className?: string;
  variant?: LeafVariant;
  cycle?: 1 | 2 | 3;
  delay?: number; // seconds
  size?: number; // px width/height
  rotation?: number; // base rotation in degrees
  flip?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

const colorMap: Record<LeafVariant, { main: string; light: string; shadow: string; vein: string; stem: string }> = {
  emerald: {
    main: '#059669', // Emerald 600
    light: '#34d399', // Emerald 400
    shadow: '#064e3b', // Emerald 900
    vein: '#a7f3d0', // Emerald 200
    stem: '#022c22',
  },
  moss: {
    main: '#15803d', // Green 700
    light: '#4ade80', // Green 400
    shadow: '#14532d', // Green 900
    vein: '#bbf7d0',
    stem: '#0b381d',
  },
  gold: {
    main: '#d97706', // Amber 600
    light: '#fbbf24', // Amber 400
    shadow: '#78350f', // Amber 900
    vein: '#fef3c7',
    stem: '#451a03',
  },
  amber: {
    main: '#b45309',
    light: '#f59e0b',
    shadow: '#451a03',
    vein: '#fde68a',
    stem: '#2e1102',
  },
  ivy: {
    main: '#047857',
    light: '#10b981',
    shadow: '#022c22',
    vein: '#6ee7b7',
    stem: '#011c15',
  },
};

export const SylvestreLeaf: React.FC<SylvestreLeafProps> = ({
  className = '',
  variant = 'emerald',
  size = 22,
  rotation = 0,
  flip = false,
  onClick,
  title,
}) => {
  const colors = colorMap[variant];

  return (
    <div
      onClick={onClick}
      title={title}
      className={`inline-block select-none ${
        onClick ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none cursor-default'
      } sylvestre-leaf ${className}`}
      style={{
        width: `${size}px`,
        height: `${Math.round(size * 1.4)}px`,
        transformOrigin: flip ? '58% 98%' : '42% 98%',
        ['--leaf-rot' as any]: `${rotation}deg`,
        ['--leaf-scale-x' as any]: flip ? -1 : 1,
      }}
    >
      <svg
        viewBox="0 0 40 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        {/* Botanical stem / Pétiole connecting the leaf to the vine or wood bark */}
        {/* Bark shadow underlayer of the stem */}
        <path
          d="M 20 40 C 19.5 45 18.5 50 17 55"
          stroke={colors.stem}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Woody / vegetal core of the stem */}
        <path
          d="M 20 40 C 19.5 45 18.5 50 17 55"
          stroke={colors.shadow}
          strokeWidth="2.0"
          strokeLinecap="round"
        />
        {/* Vascular highlight of the stem */}
        <path
          d="M 20 41 C 19.6 45 18.6 50 17.2 54"
          stroke={colors.main}
          strokeWidth="1.0"
          strokeLinecap="round"
        />

        {/* Leaf base shadow / depth */}
        <path
          d="M 20 43 C 11 36 3 27 3 16 C 3 5 12 1 20 1 C 28 1 37 5 37 16 C 37 27 29 36 20 43 Z"
          fill={colors.shadow}
        />
        {/* Leaf stylized body with lighting */}
        <path
          d="M 20 41 C 12 34 5 26 5 16 C 5 6 13 2 20 2 C 27 2 35 6 35 16 C 35 26 28 34 20 41 Z"
          fill={colors.main}
        />
        {/* Sunlit leaf facet (left half highlight for stylized 2D depth) */}
        <path
          d="M 20 3 C 14 3 7 7 7 16 C 7 24 13 33 20 39 C 20 39 19 21 20 3 Z"
          fill={colors.light}
          opacity="0.35"
        />
        {/* Central leaf vein extending through the stem */}
        <path
          d="M 17 54 C 18.5 49 19.5 44 20 40 L 20 5"
          stroke={colors.vein}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Lateral stylized veins */}
        <path
          d="M 20 33 Q 14 30 10 28"
          stroke={colors.vein}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M 20 27 Q 26 24 30 22"
          stroke={colors.vein}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M 20 20 Q 14 17 11 15"
          stroke={colors.vein}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M 20 14 Q 26 11 29 10"
          stroke={colors.vein}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Dewdrop / bioluminescent spore glint */}
        <circle cx="15" cy="13" r="1.6" fill="#ffffff" opacity="0.7" />
      </svg>
    </div>
  );
};
