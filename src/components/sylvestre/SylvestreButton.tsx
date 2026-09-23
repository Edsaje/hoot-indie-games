import React from 'react';
import { SylvestreLeaf } from './SylvestreLeaf';

interface SylvestreButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'wood' | 'gold' | 'emerald' | 'bark';
  size?: 'sm' | 'md' | 'lg';
  withLeaf?: boolean;
}

export const SylvestreButton: React.FC<SylvestreButtonProps> = ({
  children,
  variant = 'wood',
  size = 'md',
  withLeaf = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const variantStyles = {
    wood: 'bg-gradient-to-b from-[#3a281c] via-[#291b12] to-[#1a110a] border-[#6b472e] text-[#fde68a] hover:border-[#9c6a47] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    gold: 'bg-gradient-to-b from-[#d97706] via-[#b45309] to-[#78350f] border-[#fcd34d] text-slate-950 font-black hover:border-white hover:shadow-[0_0_18px_rgba(245,158,11,0.5)]',
    emerald: 'bg-gradient-to-b from-[#059669] via-[#047857] to-[#064e3b] border-[#6ee7b7] text-white font-bold hover:border-emerald-200 hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]',
    bark: 'bg-gradient-to-b from-[#241a14] via-[#1a120d] to-[#120c08] border-[#4a3424] text-slate-200 hover:border-[#7a533a]',
  }[variant];

  return (
    <button
      className={`group relative inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] active:translate-y-0.5 border shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-2px_2px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.5)] ${variantStyles} ${sizeClasses} ${className}`}
      {...props}
    >
      {/* Top bevel highlight */}
      <span className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Optional organic leaf sprouting from the corner */}
      {withLeaf && (
        <div className="absolute -top-2.5 -right-2 transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12">
          <SylvestreLeaf
            variant={variant === 'emerald' ? 'moss' : 'emerald'}
            cycle={1}
            size={13}
            rotation={35}
          />
        </div>
      )}
    </button>
  );
};
