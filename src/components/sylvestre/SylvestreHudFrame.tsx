import React from 'react';
import { SylvestreLeaf } from './SylvestreLeaf';
import { SylvestreIvyFrame } from './SylvestreIvyFrame';

interface SylvestreHudFrameProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'wood' | 'bark' | 'slate';
  accent?: 'amber' | 'emerald' | 'slate' | 'subtle';
  withLeaves?: boolean;
  withIvy?: boolean;
  interactive?: boolean;
}

export const SylvestreHudFrame: React.FC<SylvestreHudFrameProps> = ({
  children,
  className = '',
  variant = 'wood',
  accent = 'emerald',
  withLeaves = true,
  withIvy = true,
  interactive = true,
}) => {
  return (
    <div
      className={`group relative rounded-3xl transition-all duration-300 ${
        interactive ? 'hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.7)]' : ''
      } ${className}`}
    >
      {/* Outer Carved Emerald / Moss Container with Beveled Border */}
      <div
        className={`relative w-full h-full rounded-3xl overflow-visible border ${
          variant === 'bark'
            ? 'bg-gradient-to-b from-[#06241b] via-[#041913] to-[#02100c] border-[#6d3b14]'
            : variant === 'slate'
            ? 'bg-gradient-to-b from-[#09262e] via-[#05181e] to-[#020e12] border-[#0e4e5e]'
            : 'bg-gradient-to-b from-[#082e22] via-[#051f17] to-[#03130e] border-[#78350f]'
        } shadow-[inset_0_1px_1.5px_rgba(217,119,6,0.35),inset_0_-2px_4px_rgba(0,0,0,0.8),0_8px_24px_rgba(0,0,0,0.6)]`}
      >
        {/* Subtle inner wood grain overlay & ambient glow */}
        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none opacity-40 transition-opacity duration-300 ${
            interactive ? 'group-hover:opacity-75' : ''
          }`}
          style={{
            backgroundImage:
              variant === 'slate'
                ? 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08), transparent 70%)'
                : accent === 'amber'
                ? 'radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12), transparent 70%)'
                : 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.16), transparent 70%)',
          }}
        />

        {/* Top-edge carved highlight rim */}
        <div
          className={`absolute top-0 left-4 right-4 h-[1px] ${
            accent === 'amber'
              ? 'bg-gradient-to-r from-transparent via-amber-500/50 to-transparent'
              : accent === 'slate'
              ? 'bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent'
              : 'bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent'
          }`}
        />

        {/* Stylized Corner Ornaments (Forged Metal Brackets - only shown when ivy is disabled) */}
        {!withIvy && (
          <>
            {/* Top-Left Corner Bracket */}
            <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none z-10">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                <path
                  d="M 2 24 L 2 16 A 14 14 0 0 1 16 2 L 24 2"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="1.5" fill="#f59e0b" opacity="0.9" />
              </svg>
              {withLeaves && (
                <div className="absolute -top-2.5 -left-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                  <SylvestreLeaf variant="emerald" size={15} rotation={-45} />
                </div>
              )}
            </div>

            {/* Top-Right Corner Bracket */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-10">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] -scale-x-100">
                <path
                  d="M 2 24 L 2 16 A 14 14 0 0 1 16 2 L 24 2"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="1.5" fill="#f59e0b" opacity="0.9" />
              </svg>
              {withLeaves && (
                <div className="absolute -top-2.5 -right-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <SylvestreLeaf variant="moss" size={14} rotation={45} flip />
                </div>
              )}
            </div>

            {/* Bottom-Left Corner Bracket */}
            <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none z-10">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] -scale-y-100">
                <path
                  d="M 2 24 L 2 16 A 14 14 0 0 1 16 2 L 24 2"
                  stroke="#047857"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="1.2" fill="#064e3b" />
              </svg>
            </div>

            {/* Bottom-Right Corner Bracket */}
            <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none z-10">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] -scale-x-100 -scale-y-100">
                <path
                  d="M 2 24 L 2 16 A 14 14 0 0 1 16 2 L 24 2"
                  stroke="#047857"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="8" r="1.2" fill="#064e3b" />
              </svg>
              {withLeaves && (
                <div className="absolute -bottom-2 -right-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <SylvestreLeaf variant="gold" size={12} rotation={135} />
                </div>
              )}
            </div>
          </>
        )}

        {/* Delicate Climbing Ivy Frame Contour with Exact 3xl Curvature */}
        {withIvy && <SylvestreIvyFrame density="delicate" rounded="3xl" />}

        {/* Actual Content */}
        <div className="relative z-[2]">{children}</div>
      </div>
    </div>
  );
};
