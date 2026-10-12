export interface ShareCardData {
  gameMode:
    | 'Screenle'
    | 'Indledle'
    | 'Linkle'
    | 'Screenle Sprint'
    | 'Indledle Sprint'
    | 'Linkle Sprint'
    | string;
  date: string;
  isWon: boolean;
  scoreText: string; // e.g. "3/6 Essais" or "Sans faute !"
  details: string[]; // Lines to render (emojis or badges)
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawFacetedLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  variant: 'emerald' | 'moss' | 'gold'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  let colors: { shadow: string; main: string; light: string; vein: string; stem: string };
  if (variant === 'moss') {
    colors = { shadow: '#14532d', main: '#15803d', light: '#4ade80', vein: '#bbf7d0', stem: '#047857' };
  } else if (variant === 'gold') {
    colors = { shadow: '#78350f', main: '#d97706', light: '#fbbf24', vein: '#fef3c7', stem: '#78350f' };
  } else {
    colors = { shadow: '#064e3b', main: '#059669', light: '#34d399', vein: '#a7f3d0', stem: '#047857' };
  }

  const s = size / 20;

  // Stem
  ctx.beginPath();
  ctx.moveTo(0, 15 * s);
  ctx.quadraticCurveTo(0, 25 * s, -4 * s, 32 * s);
  ctx.strokeStyle = colors.stem;
  ctx.lineWidth = 2 * s;
  ctx.stroke();

  // Leaf shadow base
  ctx.beginPath();
  ctx.moveTo(0, 16 * s);
  ctx.bezierCurveTo(-10 * s, 11 * s, -14 * s, 2 * s, -14 * s, -8 * s);
  ctx.bezierCurveTo(-14 * s, -18 * s, -5 * s, -22 * s, 0, -22 * s);
  ctx.bezierCurveTo(5 * s, -22 * s, 14 * s, -18 * s, 14 * s, -8 * s);
  ctx.bezierCurveTo(14 * s, 2 * s, 10 * s, 11 * s, 0, 16 * s);
  ctx.fillStyle = colors.shadow;
  ctx.fill();

  // Leaf main body
  ctx.beginPath();
  ctx.moveTo(0, 14 * s);
  ctx.bezierCurveTo(-8 * s, 9 * s, -12 * s, 1 * s, -12 * s, -8 * s);
  ctx.bezierCurveTo(-12 * s, -17 * s, -4 * s, -21 * s, 0, -21 * s);
  ctx.bezierCurveTo(4 * s, -21 * s, 12 * s, -17 * s, 12 * s, -8 * s);
  ctx.bezierCurveTo(12 * s, 1 * s, 8 * s, 9 * s, 0, 14 * s);
  ctx.fillStyle = colors.main;
  ctx.fill();

  // Left sunlit facet
  ctx.beginPath();
  ctx.moveTo(0, -21 * s);
  ctx.bezierCurveTo(-4 * s, -17 * s, -12 * s, -8 * s, -12 * s, 1 * s);
  ctx.bezierCurveTo(-12 * s, 6 * s, -8 * s, 10 * s, 0, 14 * s);
  ctx.closePath();
  ctx.fillStyle = colors.light;
  ctx.globalAlpha = 0.45;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Central Vein
  ctx.beginPath();
  ctx.moveTo(0, -20 * s);
  ctx.lineTo(0, 14 * s);
  ctx.strokeStyle = colors.vein;
  ctx.lineWidth = 1.2 * s;
  ctx.stroke();

  // Dewdrop glint
  ctx.beginPath();
  ctx.arc(-4 * s, -8 * s, 1.4 * s, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  ctx.restore();
}

function drawIvyCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);

  // Core vine shadow
  ctx.beginPath();
  ctx.moveTo(2, 70);
  ctx.lineTo(2, 28);
  ctx.arcTo(2, 2, 28, 2, 26);
  ctx.lineTo(70, 2);
  ctx.strokeStyle = '#011f17';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Winding climber runner strand
  ctx.beginPath();
  ctx.moveTo(1, 70);
  ctx.bezierCurveTo(4, 58, 4, 46, 1.5, 36);
  ctx.bezierCurveTo(-1, 26, 4, 19, 8, 15);
  ctx.bezierCurveTo(13, 11, 18, 7, 26, 4);
  ctx.bezierCurveTo(34, 2, 42, -1, 52, 1);
  ctx.bezierCurveTo(62, 3, 66, 3, 70, 1);
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Secondary mint highlight
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Wood-wrapping coil loops
  ctx.beginPath();
  ctx.moveTo(4, 62);
  ctx.bezierCurveTo(-2, 64, -2, 56, 2, 53);
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(62, 4);
  ctx.bezierCurveTo(64, -2, 56, -2, 53, 2);
  ctx.stroke();

  // Core backbone vine
  ctx.beginPath();
  ctx.moveTo(2, 70);
  ctx.lineTo(2, 28);
  ctx.arcTo(2, 2, 28, 2, 26);
  ctx.lineTo(70, 2);
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Tendril at corner apex
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.quadraticCurveTo(20, 20, 18, 26);
  ctx.quadraticCurveTo(14, 30, 12, 24);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Joint nodes
  ctx.beginPath();
  ctx.arc(2, 50, 2.2, 0, Math.PI * 2);
  ctx.arc(50, 2, 2.2, 0, Math.PI * 2);
  ctx.arc(10, 10, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = '#047857';
  ctx.fill();

  // Botanical leaves
  drawFacetedLeaf(ctx, 56, -14, 0.3, 19, 'emerald');
  drawFacetedLeaf(ctx, -14, 56, -1.3, 18, 'moss');
  drawFacetedLeaf(ctx, 12, -6, -0.7, 16, 'gold');

  ctx.restore();
}

const loadLogoImage = (): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    // Timeout safeguard after 800ms
    setTimeout(() => resolve(null), 800);
    img.src = '/logo-512.png';
  });
};

export const generateShareCardDataUrl = async (data: ShareCardData): Promise<string> => {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Base Dark Forest Sanctuary Night Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#010604');
  bgGrad.addColorStop(0.35, '#06251c');
  bgGrad.addColorStop(0.75, '#031912');
  bgGrad.addColorStop(1, '#010604');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Radiant Glows
  // Golden canopy glow (top-left behind logo & brand)
  const goldGlow = ctx.createRadialGradient(200, 140, 20, 200, 140, 480);
  goldGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
  goldGlow.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
  goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, width, height);

  // Emerald mist glow (bottom right)
  const emeraldGlow = ctx.createRadialGradient(
    width - 250,
    height - 180,
    20,
    width - 250,
    height - 180,
    450
  );
  emeraldGlow.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  emeraldGlow.addColorStop(0.6, 'rgba(5, 150, 105, 0.06)');
  emeraldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = emeraldGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Bioluminescent Forest Spores & Fireflies
  const spores = [
    { x: 90, y: 80, r: 2, c: '#fef08a', a: 0.85 },
    { x: 170, y: 220, r: 2.5, c: '#34d399', a: 0.8 },
    { x: 310, y: 70, r: 2, c: '#fbbf24', a: 0.75 },
    { x: 450, y: 130, r: 1.8, c: '#ffffff', a: 0.8 },
    { x: 780, y: 85, r: 2.2, c: '#a7f3d0', a: 0.8 },
    { x: 920, y: 140, r: 2, c: '#fde68a', a: 0.85 },
    { x: 1080, y: 90, r: 2.5, c: '#34d399', a: 0.8 },
    { x: 1140, y: 240, r: 2, c: '#fbbf24', a: 0.7 },
    { x: 70, y: 460, r: 2.2, c: '#34d399', a: 0.75 },
    { x: 1110, y: 490, r: 2.5, c: '#f59e0b', a: 0.8 },
    { x: 550, y: 580, r: 2, c: '#6ee7b7', a: 0.7 },
    // Fireflies with glowing halos
    { x: 230, y: 260, r: 3, c: '#34d399', a: 0.9, halo: 9 },
    { x: 1040, y: 220, r: 3, c: '#fbbf24', a: 0.9, halo: 9 },
    { x: 160, y: 520, r: 3.5, c: '#10b981', a: 0.8, halo: 10 },
    { x: 1020, y: 530, r: 3.5, c: '#fde68a', a: 0.8, halo: 10 },
  ];

  spores.forEach((s) => {
    if (s.halo) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.halo, 0, Math.PI * 2);
      ctx.fillStyle =
        s.c === '#34d399' || s.c === '#10b981'
          ? 'rgba(52, 211, 153, 0.2)'
          : 'rgba(251, 191, 36, 0.2)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.c;
    ctx.globalAlpha = s.a;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  });

  // 4. Sanctuary Outer Frame (Ancient Forest Wood & Gold Hairline)
  drawRoundedRect(ctx, 18, 18, width - 36, height - 36, 24);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 18);
  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  drawRoundedRect(ctx, 34, 34, width - 68, height - 68, 14);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Gold Corner Brackets
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  // Top-Left
  ctx.beginPath();
  ctx.moveTo(18, 56);
  ctx.lineTo(18, 38);
  ctx.arcTo(18, 18, 38, 18, 20);
  ctx.lineTo(56, 18);
  ctx.stroke();
  // Top-Right
  ctx.beginPath();
  ctx.moveTo(width - 18, 56);
  ctx.lineTo(width - 18, 38);
  ctx.arcTo(width - 18, 18, width - 38, 18, 20);
  ctx.lineTo(width - 56, 18);
  ctx.stroke();
  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(18, height - 56);
  ctx.lineTo(18, height - 38);
  ctx.arcTo(18, height - 18, 38, height - 18, 20);
  ctx.lineTo(56, height - 18);
  ctx.stroke();
  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(width - 18, height - 56);
  ctx.lineTo(width - 18, height - 38);
  ctx.arcTo(width - 18, height - 18, width - 38, height - 18, 20);
  ctx.lineTo(width - 56, height - 18);
  ctx.stroke();

  // 5. Botanical Ivy in 4 Corners
  drawIvyCorner(ctx, 18, 18, 1, 1);
  drawIvyCorner(ctx, width - 18, 18, -1, 1);
  drawIvyCorner(ctx, 18, height - 18, 1, -1);
  drawIvyCorner(ctx, width - 18, height - 18, -1, -1);

  // 6. Inner Card Glass Container
  drawRoundedRect(ctx, 58, 58, width - 116, height - 116, 20);
  ctx.fillStyle = 'rgba(4, 28, 20, 0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 7. Header Brand with Owl Mascot Medallion
  const cx = 120;
  const cy = 120;
  const r = 38;

  // Glow behind medallion
  const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, 65);
  halo.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
  halo.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 65, 0, Math.PI * 2);
  ctx.fill();

  // Medallion circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#041c14';
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Draw mascot logo image if available, else fallback glyph
  const logoImg = await loadLogoImage();
  if (logoImg) {
    ctx.drawImage(logoImg, cx - 30, cy - 30, 60, 60);
  } else {
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦉', cx, cy);
  }

  // Typography
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // "HOOT INDIE GAMES"
  ctx.font = 'bold 30px ui-sans-serif, system-ui, -apple-system, sans-serif';
  let curX = 180;
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('HOOT ', curX, 114);
  curX += ctx.measureText('HOOT ').width;

  ctx.fillStyle = '#fbbf24';
  ctx.fillText('INDIE ', curX, 114);
  curX += ctx.measureText('INDIE ').width;

  ctx.fillStyle = '#f8fafc';
  ctx.fillText('GAMES', curX, 114);

  // Subtitle
  ctx.font = 'bold 12px ui-sans-serif, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText('🍃 LE SANCTUAIRE DES JEUX VIDÉO INDÉPENDANTS', 180, 134);

  // Date Monospace
  ctx.font = 'bold 14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('🗓️ DÉFI DU ', 180, 156);
  const datePrefixW = ctx.measureText('🗓️ DÉFI DU ').width;
  ctx.fillStyle = '#fef3c7';
  ctx.fillText(data.date, 180 + datePrefixW, 156);

  // Mode Pill Badge (Right side of header)
  const isSprint = data.gameMode.toLowerCase().includes('sprint');
  const badgeW = 280;
  const badgeH = 62;
  const badgeX = width - 368;
  const badgeY = 88;

  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeH);
  badgeGrad.addColorStop(0, '#062c20');
  badgeGrad.addColorStop(1, '#021610');
  ctx.fillStyle = badgeGrad;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText(
    isSprint ? 'SPRINT CHRONO SYLVESTRE' : 'DÉFI DU JOUR SYLVESTRE',
    badgeX + badgeW / 2,
    badgeY + 22
  );

  ctx.font = '900 22px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#fef3c7';
  ctx.fillText('✨ ' + data.gameMode.toUpperCase(), badgeX + badgeW / 2, badgeY + 48);

  // 8. Outcome & Score Headline
  ctx.textAlign = 'left';
  if (data.isWon) {
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 34px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('🏆 VICTOIRE SYLVESTRE ! 🦉', 90, 225);
  } else {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 34px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText('🎯 DÉFI TERMINÉ ! 🦉', 90, 225);
  }

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 24px ui-sans-serif, system-ui, sans-serif';
  const resPrefix = 'Résultat : ';
  ctx.fillText(resPrefix, 90, 265);
  const resPrefixW = ctx.measureText(resPrefix).width;

  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 26px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(data.scoreText, 90 + resPrefixW, 265);

  // 9. Results Matrix Box (Parchment & Seal)
  const matrixX = 90;
  const matrixY = 295;
  const matrixW = width - 180;
  const matrixH = 195;

  drawRoundedRect(ctx, matrixX, matrixY, matrixW, matrixH, 18);
  const matrixGrad = ctx.createLinearGradient(matrixX, matrixY, matrixX, matrixY + matrixH);
  matrixGrad.addColorStop(0, '#021811');
  matrixGrad.addColorStop(1, '#052219');
  ctx.fillStyle = matrixGrad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Inner emerald hairline
  drawRoundedRect(ctx, matrixX + 4, matrixY + 4, matrixW - 8, matrixH - 8, 14);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Emoji lines on left
  ctx.fillStyle = '#f1f5f9';
  ctx.font =
    '30px ui-monospace, SFMono-Regular, "Segoe UI Emoji", "Apple Color Emoji", Menlo, monospace';
  data.details.slice(0, 4).forEach((line, index) => {
    ctx.fillText(line, matrixX + 35, matrixY + 52 + index * 40);
  });

  // Right Seal / Shield Box inside Matrix
  const sealW = 380;
  const sealH = 145;
  const sealX = matrixX + matrixW - sealW - 25;
  const sealY = matrixY + 25;

  drawRoundedRect(ctx, sealX, sealY, sealW, sealH, 14);
  ctx.fillStyle = 'rgba(2, 20, 14, 0.75)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 16px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText('🛡️ 100% ZÉRO SPOIL', sealX + 24, sealY + 36);

  ctx.font = '500 13px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Partagez votre exploit sans révéler la solution.', sealX + 24, sealY + 64);
  ctx.fillText('Défiez vos amis sur le puzzle du jour !', sealX + 24, sealY + 86);

  ctx.font = 'bold 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('🦉 HOOT SANCTUARY • SCORE CERTIFIÉ', sealX + 24, sealY + 120);

  // 10. Footer Attribution Bar
  ctx.textAlign = 'left';
  ctx.font = '15px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('🦉 https://hootindiegames.com • Le Sanctuaire des Jeux Indépendants', 90, 532);

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('Rejoins le Perchoir 🪶', width - 90, 532);

  return canvas.toDataURL('image/png');
};

export const generateShareCardBlob = async (data: ShareCardData): Promise<Blob> => {
  const dataUrl = await generateShareCardDataUrl(data);
  const res = await fetch(dataUrl);
  return res.blob();
};

export const downloadShareCard = async (data: ShareCardData, filename?: string) => {
  const dataUrl = await generateShareCardDataUrl(data);
  const link = document.createElement('a');
  link.download = filename || `hoot-indie-${data.gameMode.toLowerCase()}-${data.date}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
