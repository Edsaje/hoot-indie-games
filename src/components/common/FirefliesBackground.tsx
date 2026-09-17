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
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 1.2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45 - 0.1, // subtle upward drift
        alpha: Math.random() * 0.7 + 0.2,
        targetAlpha: Math.random() * 0.8 + 0.2,
        hue: 35 + Math.random() * 15, // warm amber to gold (35-50)
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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] opacity-75"
    />
  );
};
