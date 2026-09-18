import React, { useEffect, useRef } from 'react';

interface Firefly {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
  hue: number; // 38 - 48 (warm amber / gold)
  pulseSpeed: number;
}

export const FirefliesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Density: roughly 1 firefly per 45,000 px^2, between 25 and 65 fireflies
    const count = Math.min(65, Math.max(25, Math.floor((width * height) / 45000)));
    const fireflies: Firefly[] = [];

    for (let i = 0; i < count; i++) {
      // 60% warm amber gold, 40% enchanted woodland emerald/moss spore glow
      const isEmerald = Math.random() < 0.4;
      const hue = isEmerald ? 142 + Math.random() * 22 : 36 + Math.random() * 14;

      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 1.2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45 - 0.1, // subtle upward drift
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        hue,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];

        // Soft pulse alpha
        if (Math.abs(f.alpha - f.targetAlpha) < 0.02) {
          f.targetAlpha = Math.random() * 0.75 + 0.15;
        }
        f.alpha += (f.targetAlpha - f.alpha) * f.pulseSpeed;

        // Gentle cursor repulsion / displacement
        const dx = f.x - mouse.x;
        const dy = f.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          f.vx += (dx / dist) * force * 0.12;
          f.vy += (dy / dist) * force * 0.12;
        }

        // Apply friction
        f.vx *= 0.98;
        f.vy *= 0.98;

        // Position update
        f.x += f.vx;
        f.y += f.vy;

        // Screen wrap-around with margins
        if (f.x < -20) f.x = width + 20;
        else if (f.x > width + 20) f.x = -20;
        if (f.y < -20) f.y = height + 20;
        else if (f.y > height + 20) f.y = -20;

        // Draw soft glowing mote
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3.5);
        gradient.addColorStop(0, `hsla(${f.hue}, 95%, 62%, ${f.alpha})`);
        gradient.addColorStop(0.35, `hsla(${f.hue}, 90%, 55%, ${f.alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${f.hue}, 90%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core bright pixel
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 100%, 85%, ${f.alpha * 0.9})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      {/* Nocturnal Woodland Canopy & Forest Floor Silhouettes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Soft ambient emerald forest mist in corners */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-950/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-emerald-950/25 blur-3xl pointer-events-none" />

        {/* Top-left organic nocturnal foliage silhouette */}
        <svg
          className="absolute -top-2 -left-2 w-56 h-56 text-emerald-950/30 opacity-60 pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M0,0 Q60,30 90,85 Q110,120 150,140 Q110,125 80,95 Q50,65 0,40 Z" />
          <path d="M20,0 Q70,40 120,60 Q90,50 50,25 Z" opacity="0.7" />
          <path d="M85,85 Q110,75 130,80 Q105,85 85,85 Z" opacity="0.85" />
        </svg>

        {/* Top-right subtle leaf canopy */}
        <svg
          className="absolute -top-2 -right-2 w-56 h-56 text-emerald-950/30 opacity-60 -scale-x-100 pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M0,0 Q60,30 90,85 Q110,120 150,140 Q110,125 80,95 Q50,65 0,40 Z" />
          <path d="M20,0 Q70,40 120,60 Q90,50 50,25 Z" opacity="0.7" />
        </svg>

        {/* Bottom subtle nocturnal forest horizon silhouette */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-16 sm:h-24 text-[#031c12]/35 pointer-events-none"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,120 L0,90 Q40,65 80,85 Q130,105 180,75 Q240,40 300,70 Q380,105 460,65 Q540,25 620,60 Q700,95 780,50 Q860,15 940,55 Q1020,95 1100,60 Q1160,35 1200,70 L1200,120 Z" />
          <path d="M0,120 L0,105 Q70,85 140,100 Q220,115 310,90 Q420,65 520,95 Q640,120 750,85 Q880,50 1000,90 Q1110,115 1200,95 L1200,120 Z" opacity="0.7" />
        </svg>
      </div>

      {/* Bioluminescent fireflies & forest spores canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[1] opacity-75"
      />
    </>
  );
};
