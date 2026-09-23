import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../../utils/audio';

interface OwlLogoProps {
  onEasterEggTrigger?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const OwlLogo: React.FC<OwlLogoProps> = ({ onEasterEggTrigger, size = 'md', className = '' }) => {
  const [isAwakened, setIsAwakened] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCountRef.current++;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    // Reset click counter if player stops clicking for 3.5s
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 3500);

    // 1. First secret threshold: 5 rapid clicks = Synthesized Hoot & Head-shake / Wink
    if (clickCountRef.current === 5) {
      soundFx.playOwlHoot();
      setIsWinking(true);
      setTimeout(() => {
        setIsWinking(false);
      }, 1200);
    }

    // 2. Ultimate secret threshold: 10 rapid clicks = Open Easter Egg modal & Golden Feather
    if (clickCountRef.current >= 10) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setIsAwakened(true);
      soundFx.playVictory();
      if (onEasterEggTrigger) {
        onEasterEggTrigger();
      }
      setTimeout(() => {
        setIsAwakened(false);
      }, 5000);
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size] || 'w-9 h-9';

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
      title="🦉 Cliquez sur Sylvestre pour éveiller les secrets de la forêt nocturne..."
    >
      <img
        src="/logo.png"
        alt="Hoot Indie Games"
        className={`${dimensions} object-contain transition-all duration-300 group-hover:scale-105 active:scale-95 ${
          isAwakened
            ? 'filter drop-shadow-[0_0_18px_rgba(245,158,11,1)] scale-110 rotate-3'
            : isWinking
            ? 'filter drop-shadow-[0_0_12px_rgba(16,185,129,0.9)] scale-108 -rotate-6'
            : 'filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]'
        }`}
        loading="eager"
      />

      {(isAwakened || isWinking) && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      )}
    </div>
  );
};

