import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';

const LOGO_PATH = path.resolve('public/logo-512.png');
const SVG_OUTPUT = path.resolve('public/linkedin-banner.svg');
const PNG_OUTPUT = path.resolve('public/linkedin-banner.png');

// 1. Read base64 data of the official Hibouxe logo
const logoBuffer = fs.readFileSync(LOGO_PATH);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

// 2. Botanical ivy corner SVG definition adapted for the 1584x396 ratio
const cornerIvySvg = `
  <g class="ivy-corner">
    <!-- Vine shadow underneath -->
    <path d="M 2 75 L 2 30 A 28 28 0 0 1 30 2 L 75 2" stroke="#011f17" stroke-width="5" stroke-linecap="round" opacity="0.75" />
    <!-- Secondary organic runner weaving around -->
    <path d="M 1 75 C 4 64, 4 50, 1.5 38 C -0.8 28, 4 20, 9 16 C 14 12, 19 8, 26 5 C 34 2, 42 -1, 52 1.5 C 64 4, 70 4, 75 1" stroke="#047857" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 1 75 C 4 64, 4 50, 1.5 38 C -0.8 28, 4 20, 9 16 C 14 12, 19 8, 26 5 C 34 2, 42 -1, 52 1.5 C 64 4, 70 4, 75 1" stroke="#6ee7b7" stroke-width="0.9" stroke-linecap="round" opacity="0.8" />
    
    <!-- Wood wrapping coil loops -->
    <path d="M 4 68 C -3 70, -3 62, 2 59" stroke="#047857" stroke-width="2.2" stroke-linecap="round" />
    <path d="M 3 67 C -1 68, -1 63, 2 60" stroke="#34d399" stroke-width="0.9" stroke-linecap="round" opacity="0.85" />
    <path d="M 68 4 C 70 -3, 62 -3, 59 2" stroke="#047857" stroke-width="2.2" stroke-linecap="round" />
    <path d="M 67 3 C 68 -1, 63 -1, 60 2" stroke="#34d399" stroke-width="0.9" stroke-linecap="round" opacity="0.85" />

    <!-- Core vine backbone -->
    <path d="M 2 75 L 2 30 A 28 28 0 0 1 30 2 L 75 2" stroke="#047857" stroke-width="3.6" stroke-linecap="round" />
    <path d="M 2 75 L 2 30 A 28 28 0 0 1 30 2 L 75 2" stroke="#34d399" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />

    <!-- Apex Tendril -->
    <path d="M 11 11 Q 20 20 18 25 Q 14 29 11 23 Q 9 19 14 21" stroke="#059669" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 11 11 Q 20 20 18 25" stroke="#34d399" stroke-width="0.9" stroke-linecap="round" opacity="0.75" />

    <!-- Vegetal nodes -->
    <circle cx="2" cy="56" r="2.2" fill="#047857" />
    <circle cx="2" cy="56" r="1.1" fill="#34d399" />
    <circle cx="56" cy="2" r="2.2" fill="#047857" />
    <circle cx="56" cy="2" r="1.1" fill="#34d399" />
    <circle cx="11" cy="11" r="2.4" fill="#065f46" />
    <circle cx="11" cy="11" r="1.2" fill="#34d399" opacity="0.85" />

    <!-- Leaf 1: Horizontal Emerald Leaf -->
    <g transform="translate(58, -16) rotate(15)">
      <path d="M 14 30 C 7 24 2 17 2 10 C 2 3 8 1 14 1 C 20 1 26 3 26 10 C 26 17 21 24 14 30 Z" fill="#064e3b" />
      <path d="M 14 28 C 8 23 4 17 4 10 C 4 4 9 2 14 2 C 19 2 24 4 24 10 C 24 17 20 23 14 28 Z" fill="#059669" />
      <path d="M 14 3 C 9 3 5 5 5 11 C 5 16 9 22 14 26 Z" fill="#34d399" opacity="0.4" />
      <line x1="14" y1="3" x2="14" y2="28" stroke="#a7f3d0" stroke-width="1" stroke-linecap="round" opacity="0.8" />
      <path d="M 14 28 Q 14 36 9 41" stroke="#047857" stroke-width="2" stroke-linecap="round" />
      <circle cx="10" cy="8" r="1.3" fill="#ffffff" opacity="0.75" />
    </g>

    <!-- Leaf 2: Vertical Moss Leaf -->
    <g transform="translate(-16, 58) rotate(-75)">
      <path d="M 14 30 C 7 24 2 17 2 10 C 2 3 8 1 14 1 C 20 1 26 3 26 10 C 26 17 21 24 14 30 Z" fill="#14532d" />
      <path d="M 14 28 C 8 23 4 17 4 10 C 4 4 9 2 14 2 C 19 2 24 4 24 10 C 24 17 20 23 14 28 Z" fill="#15803d" />
      <path d="M 14 3 C 9 3 5 5 5 11 C 5 16 9 22 14 26 Z" fill="#4ade80" opacity="0.4" />
      <line x1="14" y1="3" x2="14" y2="28" stroke="#bbf7d0" stroke-width="1" stroke-linecap="round" opacity="0.8" />
      <path d="M 14 28 Q 14 36 9 41" stroke="#047857" stroke-width="2" stroke-linecap="round" />
    </g>

    <!-- Leaf 3: Corner Golden Ivy Leaf -->
    <g transform="translate(13, -7) rotate(-40)">
      <path d="M 14 28 C 8 23 3 16 3 9 C 3 3 9 1 14 1 C 19 1 25 3 25 9 C 25 16 20 23 14 28 Z" fill="#78350f" />
      <path d="M 14 26 C 9 22 5 15 5 9 C 5 4 9 2 14 2 C 19 2 23 4 23 9 C 23 15 19 22 14 26 Z" fill="#d97706" />
      <path d="M 14 3 C 10 3 6 5 6 10 C 6 15 10 20 14 24 Z" fill="#fbbf24" opacity="0.45" />
      <line x1="14" y1="3" x2="14" y2="26" stroke="#fef3c7" stroke-width="1" stroke-linecap="round" opacity="0.85" />
      <path d="M 14 26 Q 13 32 8 36" stroke="#78350f" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="10" cy="8" r="1.2" fill="#ffffff" opacity="0.8" />
    </g>
  </g>
`;

// 3. 1584 x 396 LinkedIn Banner SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1584 396" width="1584" height="396">
  <defs>
    <!-- Background Gradients: Deep Forest Sanctuary Night -->
    <radialGradient id="canopyBg" cx="45%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#09291e" stop-opacity="1" />
      <stop offset="35%" stop-color="#051912" stop-opacity="1" />
      <stop offset="70%" stop-color="#02100b" stop-opacity="1" />
      <stop offset="100%" stop-color="#010604" stop-opacity="1" />
    </radialGradient>
    
    <!-- Ambient Golden Glow filtering through the trees -->
    <radialGradient id="goldCanopyGlow" cx="48%" cy="15%" r="65%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.32" />
      <stop offset="35%" stop-color="#d97706" stop-opacity="0.16" />
      <stop offset="70%" stop-color="#78350f" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Side Emerald Mist Auras -->
    <radialGradient id="emeraldAuraLeft" cx="12%" cy="65%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.24" />
      <stop offset="60%" stop-color="#059669" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#010604" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="emeraldAuraRight" cx="88%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
      <stop offset="60%" stop-color="#059669" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#010604" stop-opacity="0" />
    </radialGradient>

    <!-- Owl Mascot Radiant Halo -->
    <radialGradient id="owlHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.55" />
      <stop offset="28%" stop-color="#f59e0b" stop-opacity="0.4" />
      <stop offset="65%" stop-color="#10b981" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#010604" stop-opacity="0" />
    </radialGradient>

    <!-- Brand Typography Gradients -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="30%" stop-color="#fbbf24" />
      <stop offset="70%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a7f3d0" />
      <stop offset="40%" stop-color="#34d399" />
      <stop offset="80%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <!-- Ancient Wood Bark Borders -->
    <linearGradient id="woodBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#92400e" />
      <stop offset="50%" stop-color="#78350f" />
      <stop offset="100%" stop-color="#451a03" />
    </linearGradient>

    <!-- Feature Pill Gradients -->
    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#07281d" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#02140d" stop-opacity="0.98" />
    </linearGradient>
  </defs>

  <!-- ==================== 1. BASE CANOPY BACKGROUND ==================== -->
  <rect width="1584" height="396" fill="#010604" />
  <rect width="1584" height="396" fill="url(#canopyBg)" />
  <rect width="1584" height="396" fill="url(#goldCanopyGlow)" />
  <rect width="1584" height="396" fill="url(#emeraldAuraLeft)" />
  <rect width="1584" height="396" fill="url(#emeraldAuraRight)" />

  <!-- Bioluminescent Forest Spores & Fireflies (Lucioles Sylvestres) -->
  <g opacity="0.8">
    <circle cx="80" cy="50" r="1.5" fill="#fef08a" opacity="0.8" />
    <circle cx="160" cy="110" r="2.2" fill="#34d399" opacity="0.75" />
    <circle cx="240" cy="65" r="2" fill="#fbbf24" opacity="0.8" />
    <circle cx="320" cy="140" r="1.8" fill="#ffffff" opacity="0.8" />
    
    <circle cx="490" cy="55" r="2.5" fill="#fde68a" opacity="0.85" />
    <circle cx="680" cy="40" r="2" fill="#34d399" opacity="0.75" />
    <circle cx="890" cy="65" r="2.2" fill="#f59e0b" opacity="0.8" />
    <circle cx="1060" cy="45" r="1.8" fill="#a7f3d0" opacity="0.8" />
    <circle cx="1220" cy="70" r="2" fill="#fef08a" opacity="0.85" />
    <circle cx="1380" cy="40" r="2.5" fill="#34d399" opacity="0.75" />
    <circle cx="1520" cy="90" r="1.8" fill="#fbbf24" opacity="0.8" />

    <!-- Lower floating particles (spores) -->
    <circle cx="95" cy="220" r="2.2" fill="#34d399" opacity="0.7" />
    <circle cx="210" cy="260" r="2" fill="#fde68a" opacity="0.7" />
    <circle cx="580" cy="355" r="2" fill="#6ee7b7" opacity="0.7" />
    <circle cx="820" cy="365" r="2.5" fill="#f59e0b" opacity="0.75" />
    <circle cx="1120" cy="350" r="2.2" fill="#34d399" opacity="0.75" />
    <circle cx="1490" cy="320" r="2" fill="#fbbf24" opacity="0.7" />

    <!-- Fireflies with glowing radiant halos -->
    <circle cx="190" cy="170" r="3" fill="#34d399" opacity="0.9" />
    <circle cx="190" cy="170" r="10" fill="#34d399" opacity="0.2" />

    <circle cx="420" cy="280" r="3.2" fill="#fbbf24" opacity="0.9" />
    <circle cx="420" cy="280" r="10" fill="#fbbf24" opacity="0.2" />

    <circle cx="980" cy="30" r="3" fill="#34d399" opacity="0.85" />
    <circle cx="980" cy="30" r="9" fill="#34d399" opacity="0.2" />

    <circle cx="1440" cy="130" r="3.2" fill="#fde68a" opacity="0.9" />
    <circle cx="1440" cy="130" r="10" fill="#fde68a" opacity="0.2" />
  </g>

  <!-- ==================== 2. SANCTUARY FRAMING ==================== -->
  <!-- Outer Ancient Wood Frame -->
  <rect x="14" y="14" width="1556" height="368" rx="20" fill="none" stroke="url(#woodBorder)" stroke-width="3" />
  <!-- Inner Emerald Vine Hairline -->
  <rect x="22" y="22" width="1540" height="352" rx="16" fill="none" stroke="#047857" stroke-width="1.6" opacity="0.75" />
  <rect x="28" y="28" width="1528" height="340" rx="12" fill="none" stroke="url(#goldGradient)" stroke-width="0.9" opacity="0.35" />

  <!-- Corner Gold Brackets -->
  <path d="M14 54 V30 A16 16 0 0 1 30 14 H54" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" />
  <path d="M1530 14 H1554 A16 16 0 0 1 1570 30 V54" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" />
  <path d="M14 342 V366 A16 16 0 0 0 30 382 H54" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" />
  <path d="M1530 382 H1554 A16 16 0 0 0 1570 366 V342" fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" />

  <!-- ==================== 3. BOTANICAL IVY VINES IN CORNERS ==================== -->
  <!-- Top-Left Corner -->
  <g transform="translate(14, 14)">
    ${cornerIvySvg}
  </g>
  <!-- Top-Right Corner -->
  <g transform="translate(1570, 14) scale(-1, 1)">
    ${cornerIvySvg}
  </g>
  <!-- Bottom-Right Corner -->
  <g transform="translate(1570, 382) scale(-1, -1)">
    ${cornerIvySvg}
  </g>
  <!-- Bottom-Left (Gentle vine framing that hugs the avatar border) -->
  <g transform="translate(14, 382) scale(1, -1) opacity(0.85)">
    ${cornerIvySvg}
  </g>

  <!-- ==================== 4. CENTER MASCOT MEDALLION ==================== -->
  <!-- Positioned at x=340, y=198 (Safely right of LinkedIn Profile Avatar) -->
  <g transform="translate(340, 198)">
    <!-- Radiant Halo -->
    <circle cx="0" cy="0" r="115" fill="url(#owlHalo)" />
    <!-- Outer Medallion Wood & Gold -->
    <circle cx="0" cy="0" r="66" fill="#041f17" stroke="url(#woodBorder)" stroke-width="2.6" />
    <circle cx="0" cy="0" r="61" fill="none" stroke="url(#goldGradient)" stroke-width="1.2" opacity="0.85" />
    <!-- Mascot Logo Image (124x124) -->
    <image href="${logoBase64}" x="-62" y="-62" width="124" height="124" preserveAspectRatio="xMidYMid meet" />
  </g>

  <!-- ==================== 5. BRAND TITLES & CREATOR IDENTITY ==================== -->
  <!-- Content Block starting at x=445 -->
  <g transform="translate(445, 0)">
    <!-- Line 1: Main Brand Name -->
    <text x="0" y="112" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif" font-weight="900" font-size="44" letter-spacing="3.5">
      <tspan fill="#f8fafc">HOOT </tspan>
      <tspan fill="url(#goldGradient)">INDIE </tspan>
      <tspan fill="#f8fafc">GAMES</tspan>
    </text>

    <!-- Line 2: Sanctuary Slogan / Tagline -->
    <text x="0" y="148" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" fill="url(#goldGradient)" letter-spacing="3">
      ✨ LE SANCTUAIRE DES JEUX VIDÉO INDÉPENDANTS ✨
    </text>

    <!-- Line 3: Creator Credentials for LinkedIn -->
    <text x="0" y="180" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="14.5" fill="#e2e8f0" letter-spacing="0.5">
      Conçu &amp; Développé par <tspan fill="#fde68a" font-weight="800">Quentin Beaud (Hibouxe)</tspan> • Plateforme Web &amp; Mobile
    </text>

    <!-- Line 4: 4 Feature Pillar Badges -->
    <g transform="translate(0, 206)">
      <!-- Badge 1: 274 Pépites -->
      <g transform="translate(0, 0)">
        <rect width="168" height="64" rx="12" fill="url(#pillGrad)" stroke="#f59e0b" stroke-width="1.4" />
        <rect x="18" y="0" width="132" height="2" rx="1" fill="#f59e0b" />
        <text x="84" y="27" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#fef3c7" letter-spacing="0.5">💎 274 PÉPITES</text>
        <text x="84" y="47" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#fbbf24">Catalogue Steam Certifié</text>
      </g>

      <!-- Badge 2: Classeur Sylvestre -->
      <g transform="translate(180, 0)">
        <rect width="176" height="64" rx="12" fill="url(#pillGrad)" stroke="#10b981" stroke-width="1.4" />
        <rect x="18" y="0" width="140" height="2" rx="1" fill="#10b981" />
        <text x="88" y="27" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#ecfdf5" letter-spacing="0.5">🃏 CLASSEUR 3D</text>
        <text x="88" y="47" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#34d399">Cartes &amp; Boosters Sylvestres</text>
      </g>

      <!-- Badge 3: 17+ Mini-Jeux -->
      <g transform="translate(368, 0)">
        <rect width="172" height="64" rx="12" fill="url(#pillGrad)" stroke="#84cc16" stroke-width="1.4" />
        <rect x="18" y="0" width="136" height="2" rx="1" fill="#84cc16" />
        <text x="86" y="27" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#f7fee7" letter-spacing="0.5">🎮 17+ MINI-JEUX</text>
        <text x="86" y="47" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#a3e635">9 Défis du Jour à Minuit</text>
      </g>

      <!-- Badge 4: Salle d'Arcade 1982 -->
      <g transform="translate(552, 0)">
        <rect width="168" height="64" rx="12" fill="url(#pillGrad)" stroke="#c084fc" stroke-width="1.4" />
        <rect x="18" y="0" width="132" height="2" rx="1" fill="#c084fc" />
        <text x="84" y="27" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#faf5ff" letter-spacing="0.5">🕹️ ARCADE 1982</text>
        <text x="84" y="47" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#c084fc">8 Bornes &amp; Mine Storm</text>
      </g>
    </g>

    <!-- Line 5: Tech stack & Values sub-badge -->
    <text x="0" y="306" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-weight="600" font-size="12" fill="#94a3b8" letter-spacing="0.5">
      ⚡ React 19 • TypeScript • Tailwind v4 • Web Audio Synth • P2P WebRTC • 0 Tracker • 100% Passion
    </text>
  </g>

  <!-- ==================== 6. RIGHT SIDE: OFFICIAL PORTAL & LINK ==================== -->
  <!-- Discovery Portal Box (x=1200 to 1540) -->
  <g transform="translate(1205, 102)">
    <rect width="335" height="192" rx="18" fill="url(#pillGrad)" stroke="url(#woodBorder)" stroke-width="1.8" />
    <rect x="4" y="4" width="327" height="184" rx="14" fill="none" stroke="#047857" stroke-width="1.2" opacity="0.6" />
    
    <!-- Live Beacon -->
    <g transform="translate(167, 36)">
      <circle cx="-100" cy="0" r="8" fill="#10b981" opacity="0.25" />
      <circle cx="-100" cy="0" r="4" fill="#34d399" />
      <text x="-86" y="4.5" font-family="system-ui, sans-serif" font-weight="800" font-size="11.5" fill="#a7f3d0" letter-spacing="1.5">
        ACCÈS LIBRE EN LIGNE
      </text>
    </g>

    <!-- Official URL Highlight -->
    <text x="167" y="80" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-weight="900" font-size="18" fill="#fbbf24" letter-spacing="0.5">
      hootindiegames.com
    </text>

    <!-- Subtitle Perks -->
    <text x="167" y="112" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="#e2e8f0">
      Sans Inscription • Sans Publicité
    </text>
    <text x="167" y="132" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="500" font-size="11.5" fill="#94a3b8">
      Aucune Microtransaction • PWA Installable
    </text>

    <!-- Button / Badge: Découvrir le Sanctuaire -->
    <g transform="translate(167, 158)">
      <rect x="-120" y="-14" width="240" height="28" rx="14" fill="#064e3b" stroke="#10b981" stroke-width="1.2" />
      <text x="0" y="4" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="#ecfdf5" letter-spacing="1">
        EXPLORER LE SANCTUAIRE ↗
      </text>
    </g>
  </g>
</svg>`;

// Write SVG file
fs.writeFileSync(SVG_OUTPUT, svgContent, 'utf-8');
console.log(`✅ Generated ${SVG_OUTPUT}`);

// 4. Render to PNG with Sharp (cross-platform 1584x396)
async function renderPng() {
  try {
    await sharp(Buffer.from(svgContent))
      .png()
      .toFile(PNG_OUTPUT);
    console.log(`✅ Rendered PNG screenshot with sharp to ${PNG_OUTPUT}`);
  } catch (err) {
    console.warn('Sharp rendering failed, falling back to chrome:', err);
    try {
      const fileUrl = `file:///${SVG_OUTPUT.replace(/\\\\/g, '/')}`;
      execSync(`google-chrome --headless=new --screenshot="${PNG_OUTPUT}" --window-size=1584,396 --default-background-color=010604 "${fileUrl}"`, { stdio: 'inherit' });
      console.log(`✅ Rendered PNG screenshot with google-chrome to ${PNG_OUTPUT}`);
    } catch (chromeErr) {
      console.error('All rendering options failed:', chromeErr);
    }
  }
}

renderPng();
