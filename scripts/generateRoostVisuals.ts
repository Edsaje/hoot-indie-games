import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const roostDir = path.resolve('public/roost');
if (!fs.existsSync(roostDir)) {
  fs.mkdirSync(roostDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function renderHtmlToPng(htmlContent: string, outputPath: string) {
  const tmpHtml = path.resolve(roostDir, 'temp_render.html');
  fs.writeFileSync(tmpHtml, htmlContent, 'utf-8');
  const fileUrl = `file:///${tmpHtml.replace(/\\/g, '/')}`;
  const absOut = path.resolve(outputPath);

  const cmd = `powershell -Command "Start-Process '${chromePath}' -ArgumentList '--headless=new', '--screenshot=\\"${absOut}\\"', '--window-size=1200,675', '--default-background-color=04060c', '${fileUrl}' -Wait"`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Rendered ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed rendering ${outputPath}:`, err);
  } finally {
    if (fs.existsSync(tmpHtml)) {
      fs.unlinkSync(tmpHtml);
    }
  }
}

// 1. YouTube Banner
export function generateYoutubeBanner() {
  const logoPath = 'D:/Hibouxe/Logo/couleur fond noir.jpg';
  let logoBase64 = '';
  if (fs.existsSync(logoPath)) {
    logoBase64 = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 675px;
    background: radial-gradient(circle at 50% 35%, #0f172a 0%, #080d1a 50%, #030508 100%);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .glow-cyan {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -55%);
    width: 650px;
    height: 450px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(2, 132, 199, 0.12) 50%, transparent 75%);
    pointer-events: none;
  }
  .glow-red {
    position: absolute;
    bottom: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 300px;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .frame {
    position: absolute;
    inset: 20px;
    border: 2px solid #1e293b;
    border-radius: 24px;
    pointer-events: none;
  }
  .frame-inner {
    position: absolute;
    inset: 28px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 18px;
    pointer-events: none;
  }
  .logo-container {
    width: 220px;
    height: 220px;
    border-radius: 36px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(6, 182, 212, 0.35);
    border: 3px solid rgba(56, 189, 248, 0.4);
    margin-bottom: 24px;
    background: #000;
  }
  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .yt-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 20px;
    background: rgba(239, 68, 68, 0.15);
    border: 1.5px solid rgba(239, 68, 68, 0.5);
    border-radius: 9999px;
    color: #fca5a5;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .yt-play-icon {
    width: 22px;
    height: 16px;
    background: #ef4444;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .yt-triangle {
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 7px solid white;
    margin-left: 2px;
  }
  h1 {
    font-size: 52px;
    font-weight: 900;
    letter-spacing: 3px;
    color: #ffffff;
    margin-bottom: 10px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.7);
  }
  h1 span {
    color: #38bdf8;
  }
  .tagline {
    font-size: 20px;
    font-weight: 700;
    color: #fbbf24;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .desc {
    font-size: 16px;
    color: #94a3b8;
    max-width: 800px;
    text-align: center;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="frame-inner"></div>
  <div class="glow-cyan"></div>
  <div class="glow-red"></div>

  <div class="yt-badge">
    <div class="yt-play-icon"><div class="yt-triangle"></div></div>
    <span>Chaîne Officielle YouTube</span>
  </div>

  <div class="logo-container">
    <img src="${logoBase64}" class="logo-img" alt="Hibouxe Logo" />
  </div>

  <h1>HIBOUXE <span>@Hibouxe</span></h1>
  <div class="tagline">Récits • Histoires • Lore des Jeux Vidéo</div>
  <div class="desc">Vidéos immersives et récits scénarisés racontant l'histoire complète, les aventures et les destins marquants des jeux vidéo.</div>
</body>
</html>`;

  renderHtmlToPng(html, 'public/roost/youtube_hibouxe.png');
}

// 2. Naheulbeuk Fan Game Banner (with authentic Barbarian and Elf sprites)
export function generateNaheulbeukBanner() {
  const barbarePath = 'public/roost/naheulbeuk_barbare.png';
  const elfePath = 'public/roost/naheulbeuk_elfe.png';

  let barbareBase64 = '';
  let elfeBase64 = '';
  if (fs.existsSync(barbarePath)) {
    barbareBase64 = `data:image/png;base64,${fs.readFileSync(barbarePath).toString('base64')}`;
  }
  if (fs.existsSync(elfePath)) {
    elfeBase64 = `data:image/png;base64,${fs.readFileSync(elfePath).toString('base64')}`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 675px;
    background: radial-gradient(circle at 50% 40%, #1e1710 0%, #120e09 55%, #080604 100%);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    padding: 0 40px;
  }
  .dungeon-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }
  .glow-amber {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.08) 50%, transparent 75%);
    pointer-events: none;
  }
  .frame {
    position: absolute;
    inset: 20px;
    border: 2px solid #78350f;
    border-radius: 24px;
    pointer-events: none;
  }
  .frame-inner {
    position: absolute;
    inset: 28px;
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 18px;
    pointer-events: none;
  }
  .char-left, .char-right {
    width: 320px;
    height: 580px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .char-img {
    height: 100%;
    max-height: 520px;
    object-fit: contain;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.95)) drop-shadow(0 0 25px rgba(245, 158, 11, 0.25));
  }
  .center-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    z-index: 3;
    padding: 0 10px;
  }
  .badge {
    padding: 8px 24px;
    background: rgba(245, 158, 11, 0.15);
    border: 1.5px solid rgba(245, 158, 11, 0.5);
    border-radius: 9999px;
    color: #fbbf24;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  h1 {
    font-size: 48px;
    font-weight: 900;
    letter-spacing: 2px;
    color: #ffffff;
    line-height: 1.15;
    margin-bottom: 10px;
    text-shadow: 0 4px 25px rgba(0,0,0,0.9);
  }
  h1 span {
    color: #f59e0b;
  }
  .subtitle {
    font-size: 20px;
    font-weight: 700;
    color: #fde68a;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 18px;
  }
  .pill {
    padding: 7px 15px;
    background: #1c140c;
    border: 1.5px solid #78350f;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #fbbf24;
  }
  .desc {
    font-size: 15px;
    color: #cbd5e1;
    max-width: 480px;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="frame-inner"></div>
  <div class="dungeon-grid"></div>
  <div class="glow-amber"></div>

  <div class="char-left">
    <img src="${barbareBase64}" class="char-img" alt="Le Barbare" />
  </div>

  <div class="center-content">
    <div class="badge">⚔️ Fan Game Tactique RPG</div>
    <h1>DONJON DE<br><span>NAHEULBEUK 2.0</span></h1>
    <div class="subtitle">Prototype de Donjon Crawler Rétro</div>
    <div class="pills">
      <span class="pill">Architecture C# & Godot</span>
      <span class="pill">Pathfinding A* & FOV</span>
      <span class="pill">Combat Tour par Tour</span>
    </div>
    <div class="desc">Algorithmes de déplacement tactique sur grille, calculs de ligne de mire, probabilités de dés et escarmouches médiévales déjantées.</div>
  </div>

  <div class="char-right">
    <img src="${elfeBase64}" class="char-img" alt="L'Elfe" />
  </div>
</body>
</html>`;

  renderHtmlToPng(html, 'public/roost/naheulbeuk_fan_game.png');
}

// 4. Mini-Games Hub Banner (with official owl emblem)
export function generateMinigamesBanner() {
  const owlLogoPath = 'public/logo-512.png';
  let owlBase64 = '';
  if (fs.existsSync(owlLogoPath)) {
    owlBase64 = `data:image/png;base64,${fs.readFileSync(owlLogoPath).toString('base64')}`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 675px;
    background: radial-gradient(circle at 50% 35%, #0d281e 0%, #061711 55%, #020806 100%);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .glow-emerald {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 750px;
    height: 450px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 75%);
    pointer-events: none;
  }
  .frame {
    position: absolute;
    inset: 20px;
    border: 2px solid #059669;
    border-radius: 24px;
    pointer-events: none;
  }
  .frame-inner {
    position: absolute;
    inset: 28px;
    border: 1px solid rgba(52, 211, 153, 0.35);
    border-radius: 18px;
    pointer-events: none;
  }
  .badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 22px;
    background: rgba(16, 185, 129, 0.15);
    border: 1.5px solid rgba(16, 185, 129, 0.5);
    border-radius: 9999px;
    color: #34d399;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .owl-container {
    width: 120px;
    height: 120px;
    border-radius: 28px;
    overflow: hidden;
    background: #021711;
    border: 2px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 30px rgba(16, 185, 129, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  .owl-img {
    width: 90px;
    height: 90px;
    object-fit: contain;
  }
  h1 {
    font-size: 50px;
    font-weight: 900;
    letter-spacing: 3px;
    color: #ffffff;
    margin-bottom: 10px;
    text-shadow: 0 4px 25px rgba(0,0,0,0.8);
  }
  h1 span {
    color: #34d399;
  }
  .subtitle {
    font-size: 19px;
    font-weight: 700;
    color: #fde68a;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  .games-grid {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 950px;
    margin-bottom: 20px;
  }
  .game-chip {
    padding: 8px 18px;
    background: rgba(6, 36, 27, 0.9);
    border: 1px solid #10b981;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    color: #ecfdf5;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  }
  .footer-tip {
    font-size: 15px;
    color: #a7f3d0;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="frame-inner"></div>
  <div class="glow-emerald"></div>

  <div class="badge">🎯 Défis Quotidiens & Déduction Indé</div>
  <div class="owl-container">
    <img src="${owlBase64}" class="owl-img" alt="Hibouxe" />
  </div>
  <h1>LES 8 DÉFIS <span>QUOTIDIENS</span></h1>
  <div class="subtitle">Testez votre Culture du Jeu Vidéo Indépendant</div>
  
  <div class="games-grid">
    <div class="game-chip">📸 Capture (Screenle)</div>
    <div class="game-chip">🧩 Classic (Indledle)</div>
    <div class="game-chip">🔗 Connexions (Linkle)</div>
    <div class="game-chip">👤 Profil (Profille)</div>
    <div class="game-chip">⏳ Chrono Timeline</div>
    <div class="game-chip">🎨 Pixel Art Quiz</div>
    <div class="game-chip">💬 Critique Steam</div>
    <div class="game-chip">🎵 Blind Test OST</div>
  </div>

  <div class="footer-tip">Nouveaux défis chaque nuit à minuit • Mode Sprint Time Attack • Duels 1v1 P2P</div>
</body>
</html>`;

  renderHtmlToPng(html, 'public/roost/minigames_hub.png');
}

async function main() {
  generateYoutubeBanner();
  generateNaheulbeukBanner();
}

main();
