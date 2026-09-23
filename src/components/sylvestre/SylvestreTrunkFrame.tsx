import React from 'react';

export const SylvestreTrunkFrame: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* =========================================================================
          LEFT TREE TRUNK (Illustrated Game Asset)
          ========================================================================= */}
      <div className="hidden md:block absolute top-0 bottom-0 left-0 w-32 lg:w-48 xl:w-64 overflow-hidden pointer-events-none">
        <img
          src="/assets/images/sylvestre_tree_trunk.jpg"
          alt=""
          className="w-full h-full object-cover object-left opacity-70 mix-blend-screen select-none filter contrast-125 brightness-95"
        />
        {/* Soft edge gradient to blend smoothly */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#0d0906] pointer-events-none" />
      </div>

      {/* =========================================================================
          RIGHT TREE TRUNK (Mirrored Illustrated Game Asset)
          ========================================================================= */}
      <div className="hidden md:block absolute top-0 bottom-0 right-0 w-32 lg:w-48 xl:w-64 overflow-hidden pointer-events-none -scale-x-100">
        <img
          src="/assets/images/sylvestre_tree_trunk.jpg"
          alt=""
          className="w-full h-full object-cover object-left opacity-70 mix-blend-screen select-none filter contrast-125 brightness-95"
        />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#0d0906] pointer-events-none" />
      </div>

      {/* Mobile Subtle Ambience Glow */}
      <div className="md:hidden absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-emerald-950/20 to-transparent pointer-events-none" />
      <div className="md:hidden absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-emerald-950/20 to-transparent pointer-events-none" />
    </div>
  );
};
