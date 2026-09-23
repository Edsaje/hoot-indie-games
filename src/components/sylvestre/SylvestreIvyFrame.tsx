import React from 'react';
import { SylvestreLeaf } from './SylvestreLeaf';

interface SylvestreIvyFrameProps {
  className?: string;
  density?: 'delicate' | 'medium' | 'lush';
  rounded?: '2xl' | '3xl';
  borderOffset?: number;
}

export const SylvestreIvyFrame: React.FC<SylvestreIvyFrameProps> = ({
  className = '',
  density = 'delicate',
  rounded = '3xl',
  borderOffset = 2,
}) => {
  const is2xl = rounded === '2xl';

  // 1. Core vine strictly concentric with frame border-radius (R=24px or R=16px)
  const coreVinePath = is2xl
    ? 'M 1 42 L 1 16 A 15 15 0 0 1 16 1 L 42 1'
    : 'M 1 48 L 1 24 A 23 23 0 0 1 24 1 L 48 1';

  // 2. Intertwined organic runner weaving smoothly across the core vine
  const windingRunnerPath = is2xl
    ? 'M 0.5 42 C 2.5 35, 2.5 28, 0.8 22 C -0.5 17, 2.5 13, 5 10 C 7 7, 10 5, 14 3.5 C 18 2, 22 -0.5, 28 0.8 C 34 2.5, 38 2.5, 42 0.5'
    : 'M 0.5 48 C 2.5 42, 2.5 36, 0.8 30 C -0.5 24, 2.5 20, 5 15 C 8 10, 15 8, 20 5 C 24 2.5, 30 -0.5, 36 0.8 C 42 2.5, 45 2.5, 48 0.5';

  const apex = is2xl ? { x: 5.5, y: 5.5 } : { x: 8, y: 8 };

  // Reusable internal SVG paths using native SVG transformation matrix to avoid CSS transform-origin browser bugs
  const renderCornerSvg = (transform?: string) => (
    <g transform={transform}>
      {/* Ambient shadow underneath */}
      <path
        d={coreVinePath}
        stroke="#011f17"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Secondary intertwined climber strand */}
      <path
        d={windingRunnerPath}
        stroke="#047857"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="group-hover:stroke-[#10b981] transition-colors duration-300"
      />
      <path
        d={windingRunnerPath}
        stroke="#6ee7b7"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* 3D Wood-wrapping coil loops on edges */}
      <path
        d="M 2.2 44 C -1.8 45, -1.8 40, 1 38.5"
        stroke="#047857"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 1.6 43.5 C -0.8 44.2, -0.8 40.8, 1 39.5"
        stroke="#34d399"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 44 2.2 C 45 -1.8, 40 -1.8, 38.5 1"
        stroke="#047857"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 43.5 1.6 C 44.2 -0.8, 40.8 -0.8, 39.5 1"
        stroke="#34d399"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Core backbone vine */}
      <path
        d={coreVinePath}
        stroke="#047857"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="group-hover:stroke-[#10b981] transition-colors duration-300"
      />
      <path
        d={coreVinePath}
        stroke="#34d399"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Branchlet connecting to horizontal leaf */}
      <path
        d="M 36 1 Q 35 -2 33 -5"
        stroke="#047857"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Branchlet connecting to vertical leaf */}
      <path
        d="M 1 36 Q -2 35 -5 33"
        stroke="#047857"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Branchlet connecting to corner diagonal leaf (medium / lush) */}
      {density !== 'delicate' && (
        <path
          d={`M ${apex.x} ${apex.y} Q ${apex.x - 2.5} ${apex.y - 2.5} ${apex.x - 4.5} ${apex.y - 4.5}`}
          stroke="#047857"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}

      {/* Botanical spring tendril at corner apex */}
      <path
        d={`M ${apex.x} ${apex.y} Q 13 13 12 16 Q 10 18 8 15 Q 7 12 10 13`}
        stroke="#059669"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d={`M ${apex.x} ${apex.y} Q 13 13 12 16`}
        stroke="#34d399"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Vegetal joint nodes */}
      <circle cx="1" cy="36" r="1.3" fill="#047857" />
      <circle cx="36" cy="1" r="1.3" fill="#047857" />
      <circle cx={apex.x} cy={apex.y} r="1.4" fill="#065f46" />
      <circle cx={apex.x} cy={apex.y} r="0.7" fill="#34d399" opacity="0.85" />
    </g>
  );

  return (
    <div
      data-sylvestre-ivy-frame="true"
      className={`absolute pointer-events-none z-10 overflow-visible select-none !m-0 ${
        is2xl ? 'rounded-2xl' : 'rounded-3xl'
      } ${className}`}
      style={{
        top: -borderOffset,
        left: -borderOffset,
        right: -borderOffset,
        bottom: -borderOffset,
        margin: 0,
      }}
      aria-hidden="true"
    >
      {/* =========================================================================
          1. TOP-LEFT CORNER
          ========================================================================= */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="absolute top-0 left-0 w-16 h-16 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] overflow-visible pointer-events-none"
      >
        {renderCornerSvg()}
      </svg>

      {/* Leaves on Top-Left */}
      <div className="absolute pointer-events-none" style={{ left: 31, top: -16 }}>
        <SylvestreLeaf variant="emerald" size={12} rotation={-15} />
      </div>
      <div className="absolute pointer-events-none" style={{ left: -4, top: 22 }}>
        <SylvestreLeaf variant="moss" size={11} rotation={-85} />
      </div>
      {density !== 'delicate' && (
        <div
          className="absolute pointer-events-none"
          style={{ left: apex.x - 4, top: apex.y - 14 }}
        >
          <SylvestreLeaf variant="ivy" size={10} rotation={-45} />
        </div>
      )}

      {/* =========================================================================
          2. TOP-RIGHT CORNER
          ========================================================================= */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="absolute top-0 right-0 w-16 h-16 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] overflow-visible pointer-events-none"
      >
        {renderCornerSvg('translate(64, 0) scale(-1, 1)')}
      </svg>

      {/* Leaves on Top-Right */}
      <div className="absolute pointer-events-none" style={{ right: 31, top: -16 }}>
        <SylvestreLeaf variant="emerald" size={11} rotation={15} flip />
      </div>
      {density !== 'delicate' && (
        <div className="absolute pointer-events-none" style={{ right: -4, top: 22 }}>
          <SylvestreLeaf variant="ivy" size={10} rotation={85} flip />
        </div>
      )}

      {/* =========================================================================
          3. BOTTOM-LEFT CORNER
          ========================================================================= */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="absolute bottom-0 left-0 w-16 h-16 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] overflow-visible pointer-events-none"
      >
        {renderCornerSvg('translate(0, 64) scale(1, -1)')}
      </svg>

      {/* Leaves on Bottom-Left */}
      <div className="absolute pointer-events-none" style={{ left: -4, bottom: 22 }}>
        <SylvestreLeaf variant="emerald" size={10} rotation={-95} />
      </div>
      {density !== 'delicate' && (
        <div className="absolute pointer-events-none" style={{ left: 31, bottom: -16 }}>
          <SylvestreLeaf variant="moss" size={10} rotation={-165} />
        </div>
      )}

      {/* =========================================================================
          4. BOTTOM-RIGHT CORNER
          ========================================================================= */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="absolute bottom-0 right-0 w-16 h-16 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] overflow-visible pointer-events-none"
      >
        {renderCornerSvg('translate(64, 64) scale(-1, -1)')}
      </svg>

      {/* Leaves on Bottom-Right */}
      {density !== 'delicate' && (
        <div className="absolute pointer-events-none" style={{ right: -4, bottom: 22 }}>
          <SylvestreLeaf variant="gold" size={9} rotation={95} flip />
        </div>
      )}
      {density === 'lush' && (
        <div className="absolute pointer-events-none" style={{ right: 31, bottom: -16 }}>
          <SylvestreLeaf variant="ivy" size={10} rotation={165} flip />
        </div>
      )}
    </div>
  );
};
