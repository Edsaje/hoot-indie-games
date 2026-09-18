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

export const generateShareCardDataUrl = async (data: ShareCardData): Promise<string> => {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Background gradient (Night Slate)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0b0f19');
  bgGrad.addColorStop(0.6, '#0e1422');
  bgGrad.addColorStop(1, '#131a29');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle ambient amber glow in top right
  const glowGrad = ctx.createRadialGradient(width - 150, 100, 10, width - 150, 100, 450);
  glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
  glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Crisp frame border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Inner card container
  ctx.fillStyle = 'rgba(19, 26, 41, 0.85)';
  ctx.fillRect(60, 60, width - 120, height - 120);
  ctx.strokeStyle = '#27354f';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // 4. Header Brand
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.fillText('HOOT', 100, 130);

  ctx.fillStyle = '#f59e0b';
  ctx.fillText('INDIE', 195, 130);

  ctx.fillStyle = '#ffffff';
  ctx.fillText('GAMES', 290, 130);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas';
  ctx.fillText(`🗓️ DÉFI DU ${data.date}`, 100, 165);

  // Mode Pill Badge
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(width - 340, 100, 240, 44);
  ctx.fillStyle = '#0b0f19';
  ctx.font = '900 20px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.gameMode.toUpperCase(), width - 220, 130);
  ctx.textAlign = 'left';

  // 5. Outcome & Score Headline
  ctx.fillStyle = data.isWon ? '#34d399' : '#f87171';
  ctx.font = 'bold 36px ui-sans-serif, system-ui, sans-serif';
  const outcomeText = data.isWon ? 'VICTOIRE INDÉ ! 🦉' : 'DÉFI DU JOUR TERMINÉ';
  ctx.fillText(outcomeText, 100, 240);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 24px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(`Résultat : ${data.scoreText}`, 100, 280);

  // 6. Detailed Results Block (Emoji / matrix representation)
  ctx.fillStyle = '#0b0f19';
  ctx.fillRect(100, 315, width - 200, 160);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(100, 315, width - 200, 160);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '28px ui-monospace, SFMono-Regular, "Segoe UI Emoji", "Apple Color Emoji", Menlo';
  data.details.slice(0, 4).forEach((line, index) => {
    ctx.fillText(line, 130, 360 + index * 36);
  });

  // 7. Footer Attribution
  ctx.fillStyle = '#64748b';
  ctx.font = '16px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('https://hootindiegames.com • Le Sanctuaire des Jeux Indépendants', 100, 530);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 16px ui-mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('Rejoins le Perchoir 🪶', width - 100, 530);

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
