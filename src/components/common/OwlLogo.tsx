import React, { useState, useRef } from 'react';
import { soundFx } from '../../utils/audio';

interface OwlLogoProps {
  onEasterEggTrigger?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const OwlLogo: React.FC<OwlLogoProps> = ({ onEasterEggTrigger, size = 'md' }) => {
  const [isAwakened, setIsAwakened] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAwakening = () => {
    setIsAwakened(true);
    soundFx.playOwlHoot();
    if (onEasterEggTrigger) {
      onEasterEggTrigger();
    }
    // Return to normal after 5 seconds if not persistent
    setTimeout(() => {
      setIsAwakened(false);
    }, 5000);
  };

  const handleMouseEnter = () => {
    // Prolonged hover triggers awakening after 750ms
    hoverTimerRef.current = setTimeout(() => {
      triggerAwakening();
    }, 750);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleDoubleClick = () => {
    triggerAwakening();
  };

  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
      title="Double-cliquez ou survolez longuement pour réveiller le hibou"
    >
      <svg
        className={`${dimensions} transition-transform duration-300 group-hover:scale-105`}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Owl Body */}
        <path
          d="M32 4C20 4 12 14 12 28C12 45 20 58 32 60C44 58 52 45 52 28C52 14 44 4 32 4Z"
          fill="#131a29"
          stroke="#1e293b"
          strokeWidth="2.5"
        />

        {/* Feather Tufts (Ears) */}
        <path
          d="M16 8L22 18L14 19Z"
          fill="#1e293b"
          className="transition-colors group-hover:fill-amber-900/40"
        />
        <path
          d="M48 8L50 19L42 18Z"
          fill="#1e293b"
          className="transition-colors group-hover:fill-amber-900/40"
        />

        {/* Chest plumage pattern */}
        <path
          d="M26 38C28 42 36 42 38 38"
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M28 44C30 48 34 48 36 44"
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Eyes outline */}
        <circle cx="23" cy="25" r="9" fill="#0b0f19" stroke="#1e293b" strokeWidth="2" />
        <circle cx="41" cy="25" r="9" fill="#0b0f19" stroke="#1e293b" strokeWidth="2" />

        {/* Eyeballs / Irises */}
        <circle
          cx="23"
          cy="25"
          r={isAwakened ? '6.5' : '4.5'}
          fill={isAwakened ? '#f59e0b' : '#334155'}
          className={`transition-all duration-300 ${isAwakened ? 'owl-eye-pulsing' : ''}`}
        />
        <circle
          cx="41"
          cy="25"
          r={isAwakened ? '6.5' : '4.5'}
          fill={isAwakened ? '#f59e0b' : '#334155'}
          className={`transition-all duration-300 ${isAwakened ? 'owl-eye-pulsing' : ''}`}
        />

        {/* Eye pupils */}
        <circle cx="23" cy="25" r={isAwakened ? '2.5' : '2'} fill="#0b0f19" />
        <circle cx="41" cy="25" r={isAwakened ? '2.5' : '2'} fill="#0b0f19" />

        {/* Eye specular glare */}
        <circle cx="21" cy="23" r="1.5" fill="#ffffff" opacity={isAwakened ? '0.9' : '0.4'} />
        <circle cx="39" cy="23" r="1.5" fill="#ffffff" opacity={isAwakened ? '0.9' : '0.4'} />

        {/* Beak */}
        <path
          d="M32 29L35 36L32 39L29 36Z"
          fill="#f59e0b"
          className="transition-transform group-hover:scale-110"
        />
      </svg>

      {isAwakened && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      )}
    </div>
  );
};
