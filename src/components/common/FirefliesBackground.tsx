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

interface NightSkyStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isAmber: boolean;
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

    // Stationary twinkling night stars
    const starCount = Math.min(95, Math.max(45, Math.floor((width * height) / 24000)));
    const stars: NightSkyStar[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.88),
        size: Math.random() < 0.25 ? Math.random() * 1.1 + 0.8 : Math.random() * 0.65 + 0.4,
        baseAlpha: Math.random() * 0.55 + 0.3,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        isAmber: Math.random() < 0.25,
      });
    }

    // Moving Fireflies: roughly 1 firefly per 45,000 px^2, between 25 and 65 fireflies
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

      // 1. Draw twinkling celestial night stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(s.twinklePhase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.isAmber
          ? `rgba(254, 240, 138, ${currentAlpha.toFixed(2)})`
          : `rgba(220, 252, 231, ${currentAlpha.toFixed(2)})`;
        ctx.fill();
      }

      // 2. Draw drifting bioluminescent fireflies
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

        // Draw delicate glowing mote (crisp magical sparkle without diffuse stain)
        const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 1.5);
        gradient.addColorStop(0, `hsla(${f.hue}, 95%, 68%, ${f.alpha * 0.9})`);
        gradient.addColorStop(0.5, `hsla(${f.hue}, 90%, 55%, ${f.alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${f.hue}, 90%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core bright spark
        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(0.6, f.size * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue}, 100%, 88%, ${f.alpha})`;
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
      {/* Nocturnal Celestial Atmosphere & Forest Floor Silhouettes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Luminous Nocturnal Moon nestled in the canopy */}
        <div className="absolute top-12 sm:top-16 right-6 sm:right-16 md:right-28 lg:right-40 pointer-events-none select-none opacity-85 hover:opacity-100 transition-opacity">
          {/* Moon disc SVG with soft glow, craters and realistic crescent shading */}
          <svg className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(209,250,229,0.35)]" viewBox="0 0 100 100" fill="none">
            {/* Ambient lunar corona */}
            <circle cx="50" cy="50" r="46" fill="url(#lunarGlow)" opacity="0.4" />
            {/* Moon Body */}
            <circle cx="50" cy="50" r="38" fill="url(#moonSurface)" />
            {/* Subtle soft craters / lunar maria */}
            <circle cx="42" cy="40" r="7" fill="#04271c" opacity="0.25" />
            <circle cx="58" cy="56" r="9" fill="#04271c" opacity="0.22" />
            <circle cx="62" cy="38" r="5" fill="#04271c" opacity="0.2" />
            <circle cx="36" cy="58" r="6" fill="#04271c" opacity="0.22" />
            {/* Crescent shadow giving it realistic 3D lunar depth */}
            <path d="M 50 12 A 38 38 0 0 1 88 50 A 38 38 0 0 1 50 88 A 32 38 0 0 0 50 12 Z" fill="#010805" opacity="0.55" />
            {/* Ethereal edge rim */}
            <circle cx="50" cy="50" r="38" stroke="rgba(209, 250, 229, 0.4)" strokeWidth="1" />
            
            <defs>
              <radialGradient id="lunarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="moonSurface" cx="40%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="45%" stopColor="#d1fae5" />
                <stop offset="80%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Top-left organic nocturnal foliage silhouette */}
        <svg
          className="absolute -top-2 -left-2 w-56 h-56 text-[#01140c]/40 opacity-70 pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M0,0 Q60,30 90,85 Q110,120 150,140 Q110,125 80,95 Q50,65 0,40 Z" />
          <path d="M20,0 Q70,40 120,60 Q90,50 50,25 Z" opacity="0.7" />
          <path d="M85,85 Q110,75 130,80 Q105,85 85,85 Z" opacity="0.85" />
        </svg>

        {/* Top-right subtle leaf canopy */}
        <svg
          className="absolute -top-2 -right-2 w-56 h-56 text-[#01140c]/40 opacity-70 -scale-x-100 pointer-events-none"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M0,0 Q60,30 90,85 Q110,120 150,140 Q110,125 80,95 Q50,65 0,40 Z" />
          <path d="M20,0 Q70,40 120,60 Q90,50 50,25 Z" opacity="0.7" />
        </svg>

        {/* Bottom deep nocturnal pine forest skyline silhouette */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-20 sm:h-32 text-[#010906] pointer-events-none"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          {/* Layer 1: Background distant fir trees */}
          <path
            d="M0,180 L0,110 L25,125 L35,95 L45,125 L70,80 L95,125 L120,90 L145,130 L180,75 L215,125 L245,100 L275,135 L310,70 L345,120 L370,95 L400,130 L440,65 L480,125 L510,90 L545,135 L590,75 L635,125 L670,90 L705,135 L750,60 L795,125 L825,95 L860,130 L900,75 L940,120 L970,95 L1005,130 L1050,70 L1095,125 L1130,90 L1170,135 L1215,75 L1260,125 L1295,95 L1330,130 L1375,65 L1420,120 L1440,105 L1440,180 Z"
            opacity="0.5"
          />
          {/* Layer 2: Foreground dense jagged pine silhouettes */}
          <path
            d="M0,180 L0,135 L15,115 L30,140 L55,95 L80,140 L110,115 L140,145 L175,90 L210,140 L235,120 L260,145 L295,85 L330,135 L360,110 L390,145 L430,80 L470,140 L500,115 L535,145 L580,90 L625,140 L655,115 L690,150 L735,75 L780,140 L810,115 L845,145 L890,85 L935,135 L965,115 L1000,145 L1040,85 L1080,135 L1115,110 L1155,145 L1200,90 L1245,140 L1280,115 L1320,145 L1365,80 L1410,135 L1440,115 L1440,180 Z"
          />
        </svg>

        {/* Nocturnal Ground Mist Layer */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#010604] via-[#010604]/70 to-transparent pointer-events-none" />
      </div>

      {/* Bioluminescent fireflies & twinkling night stars canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[1] opacity-80"
      />
    </>
  );
};
