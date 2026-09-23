import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const LOGO_PATH = path.resolve('public/logo-512.png');
const SVG_OUTPUT = path.resolve('public/og-banner.svg');
const PNG_OUTPUT = path.resolve('public/og-banner.png');

// 1. Read base64 data of the official Hibouxe logo
const logoBuffer = fs.readFileSync(LOGO_PATH);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

// 2. Compose the ultra-clean sanctuary SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradients -->
    <radialGradient id="bgGlow" cx="50%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#111c38" stop-opacity="0.95" />
      <stop offset="42%" stop-color="#0a1122" stop-opacity="0.98" />
      <stop offset="100%" stop-color="#04060c" stop-opacity="1" />
    </radialGradient>
    
    <!-- Owl Mascot Cyan/Teal Glow -->
    <radialGradient id="owlAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.4" />
      <stop offset="35%" stop-color="#06b6d4" stop-opacity="0.25" />
      <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Side Auras -->
    <radialGradient id="goldAura" cx="12%" cy="75%" r="45%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="emeraldAura" cx="88%" cy="75%" r="45%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>

    <!-- Brand Gradients -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fde68a" />
      <stop offset="35%" stop-color="#fbbf24" />
      <stop offset="75%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a5f3fc" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <linearGradient id="frameBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.55" />
      <stop offset="50%" stop-color="#06b6d4" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.45" />
    </linearGradient>

    <!-- Feature Card Gradients -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#172238" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0b1120" stop-opacity="0.95" />
    </linearGradient>

    <!-- Card Borders with rich neon gradients -->
    <linearGradient id="borderAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#b45309" stop-opacity="0.25" />
    </linearGradient>
    <linearGradient id="borderEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#047857" stop-opacity="0.25" />
    </linearGradient>
    <linearGradient id="borderCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.25" />
    </linearGradient>
    <linearGradient id="borderPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#7e22ce" stop-opacity="0.25" />
    </linearGradient>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="1200" height="630" fill="#04060c" />
  <rect width="1200" height="630" fill="url(#bgGlow)" />
  <rect width="1200" height="630" fill="url(#goldAura)" />
  <rect width="1200" height="630" fill="url(#emeraldAura)" />

  <!-- Bioluminescent Spores & Sanctuary Stars -->
  <g opacity="0.65">
    <circle cx="95" cy="70" r="1.5" fill="#ffffff" opacity="0.8" />
    <circle cx="180" cy="130" r="2" fill="#38bdf8" opacity="0.7" />
    <circle cx="280" cy="55" r="1.5" fill="#fef08a" opacity="0.9" />
    <circle cx="380" cy="95" r="2.5" fill="#ffffff" opacity="0.7" />
    <circle cx="820" cy="85" r="1.5" fill="#67e8f9" opacity="0.8" />
    <circle cx="920" cy="55" r="2" fill="#fef08a" opacity="0.8" />
    <circle cx="1040" cy="120" r="2.5" fill="#ffffff" opacity="0.9" />
    <circle cx="1120" cy="70" r="1.5" fill="#34d399" opacity="0.7" />
    <circle cx="65" cy="280" r="2" fill="#a7f3d0" opacity="0.6" />
    <circle cx="1135" cy="310" r="2" fill="#fde68a" opacity="0.7" />
    <circle cx="115" cy="510" r="1.5" fill="#ffffff" opacity="0.6" />
    <circle cx="1085" cy="520" r="2" fill="#38bdf8" opacity="0.7" />

    <!-- Ambient glowing fireflies -->
    <circle cx="210" cy="200" r="3" fill="#38bdf8" opacity="0.6" />
    <circle cx="210" cy="200" r="9" fill="#38bdf8" opacity="0.15" />
    <circle cx="990" cy="190" r="3" fill="#fbbf24" opacity="0.6" />
    <circle cx="990" cy="190" r="9" fill="#fbbf24" opacity="0.15" />
    <circle cx="150" cy="420" r="3" fill="#34d399" opacity="0.5" />
    <circle cx="1050" cy="430" r="3" fill="#c084fc" opacity="0.5" />
  </g>

  <!-- Sanctuary Outer & Inner Framing -->
  <rect x="22" y="22" width="1156" height="586" rx="18" fill="none" stroke="#1e293b" stroke-width="1.5" opacity="0.7" />
  <rect x="34" y="34" width="1132" height="562" rx="14" fill="none" stroke="url(#frameBorder)" stroke-width="1" opacity="0.38" />

  <!-- Sanctuary Corner Flourishes (Gold Brackets) -->
  <path d="M22 62 V36 A14 14 0 0 1 36 22 H62" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <path d="M1138 22 H1164 A14 14 0 0 1 1178 36 V62" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <path d="M22 568 V594 A14 14 0 0 0 36 608 H62" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <path d="M1138 608 H1164 A14 14 0 0 0 1178 594 V568" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />

  <!-- ==================== CENTER MASCOT ==================== -->
  <!-- Radiant Aura Behind Owl -->
  <circle cx="600" cy="116" r="125" fill="url(#owlAura)" />
  <circle cx="600" cy="116" r="76" fill="#091122" stroke="#1e293b" stroke-width="1.5" opacity="0.75" />

  <!-- Official Logo Image Embedded (High-Res 150x150) -->
  <image href="${logoBase64}" x="525" y="41" width="150" height="150" preserveAspectRatio="xMidYMid meet" />

  <!-- ==================== BRAND TITLES ==================== -->
  <text x="600" y="235" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif" font-weight="900" font-size="46" letter-spacing="4">
    <tspan fill="#ffffff">HOOT </tspan>
    <tspan fill="url(#goldGradient)">INDIE </tspan>
    <tspan fill="#ffffff">GAMES</tspan>
  </text>

  <!-- Brand Mission Subtitle -->
  <text x="600" y="273" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16.5" fill="url(#goldGradient)" letter-spacing="3.5">
    LE SANCTUAIRE DES JEUX VIDÉO INDÉPENDANTS
  </text>

  <!-- Summary Micro-line -->
  <text x="600" y="303" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="14" fill="#94a3b8" letter-spacing="0.5">
    147 Pépites Steam Certifiées • 8 Défis Quotidiens • Arène 1v1 P2P • Salle d'Arcade Rétro
  </text>

  <!-- ==================== 4 FEATURE PILLARS ==================== -->
  
  <!-- Card 1: 147 Pépites Steam (Amber Accent) -->
  <g transform="translate(76, 335)">
    <rect width="244" height="135" rx="14" fill="url(#cardGrad)" stroke="url(#borderAmber)" stroke-width="1.5" />
    <rect x="25" y="0" width="194" height="2" rx="1" fill="#f59e0b" opacity="0.9" />
    <!-- Vector Gem Icon -->
    <g transform="translate(122, 34)">
      <circle cx="0" cy="0" r="18" fill="#f59e0b" opacity="0.12" />
      <polygon points="0,-12 11,-4 7,11 -7,11 -11,-4" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linejoin="round" />
      <polygon points="0,-12 5,-4 0,11 -5,-4" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <line x1="-11" y1="-4" x2="11" y2="-4" stroke="#fbbf24" stroke-width="1.5" />
    </g>
    <text x="122" y="76" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#f8fafc" letter-spacing="1">147 PÉPITES</text>
    <text x="122" y="96" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12.5" fill="#fbbf24">Catalogue Certifié Steam</text>
    <text x="122" y="116" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="11" fill="#94a3b8">Fiches, Avis &amp; OST Audio</text>
  </g>

  <!-- Card 2: 8 Défis Quotidiens (Emerald Accent) -->
  <g transform="translate(344, 335)">
    <rect width="244" height="135" rx="14" fill="url(#cardGrad)" stroke="url(#borderEmerald)" stroke-width="1.5" />
    <rect x="25" y="0" width="194" height="2" rx="1" fill="#10b981" opacity="0.9" />
    <!-- Vector Target Icon -->
    <g transform="translate(122, 34)">
      <circle cx="0" cy="0" r="18" fill="#10b981" opacity="0.12" />
      <circle cx="0" cy="0" r="13" fill="none" stroke="#34d399" stroke-width="2" />
      <circle cx="0" cy="0" r="7.5" fill="none" stroke="#10b981" stroke-width="1.8" />
      <circle cx="0" cy="0" r="3" fill="#6ee7b7" />
      <line x1="0" y1="-17" x2="0" y2="-12" stroke="#34d399" stroke-width="2" stroke-linecap="round" />
      <line x1="0" y1="12" x2="0" y2="17" stroke="#34d399" stroke-width="2" stroke-linecap="round" />
      <line x1="-17" y1="0" x2="-12" y2="0" stroke="#34d399" stroke-width="2" stroke-linecap="round" />
      <line x1="12" y1="0" x2="17" y2="0" stroke="#34d399" stroke-width="2" stroke-linecap="round" />
    </g>
    <text x="122" y="76" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#f8fafc" letter-spacing="1">8 DÉFIS DU JOUR</text>
    <text x="122" y="96" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12.5" fill="#34d399">Screenle, OST, Classic...</text>
    <text x="122" y="116" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="11" fill="#94a3b8">Nouveaux Défis à Minuit</text>
  </g>

  <!-- Card 3: Arène 1v1 P2P (Cyan Accent) -->
  <g transform="translate(612, 335)">
    <rect width="244" height="135" rx="14" fill="url(#cardGrad)" stroke="url(#borderCyan)" stroke-width="1.5" />
    <rect x="25" y="0" width="194" height="2" rx="1" fill="#38bdf8" opacity="0.9" />
    <!-- Vector Crossed Swords Icon -->
    <g transform="translate(122, 34)">
      <circle cx="0" cy="0" r="18" fill="#38bdf8" opacity="0.12" />
      <path d="M-10 -10 L10 10 M-7 -10 L-10 -7 M-4 -12 L-12 -4" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" />
      <path d="M10 -10 L-10 10 M7 -10 L10 -7 M4 -12 L12 -4" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" />
      <circle cx="0" cy="0" r="2.5" fill="#e0f2fe" />
    </g>
    <text x="122" y="76" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#f8fafc" letter-spacing="1">ARÈNE 1v1 P2P</text>
    <text x="122" y="96" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12.5" fill="#38bdf8">Duels en Direct WebRTC</text>
    <text x="122" y="116" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="11" fill="#94a3b8">Affrontez vos Amis en Ligne</text>
  </g>

  <!-- Card 4: Salle d'Arcade (Purple Accent) -->
  <g transform="translate(880, 335)">
    <rect width="244" height="135" rx="14" fill="url(#cardGrad)" stroke="url(#borderPurple)" stroke-width="1.5" />
    <rect x="25" y="0" width="194" height="2" rx="1" fill="#c084fc" opacity="0.9" />
    <!-- Vector Arcade Joystick Icon -->
    <g transform="translate(122, 34)">
      <circle cx="0" cy="0" r="18" fill="#c084fc" opacity="0.12" />
      <rect x="-12" y="-7" width="24" height="18" rx="3" fill="none" stroke="#c084fc" stroke-width="2" />
      <line x1="-4" y1="-7" x2="-4" y2="-13" stroke="#c084fc" stroke-width="2" stroke-linecap="round" />
      <circle cx="-4" cy="-14" r="3" fill="#f472b6" />
      <circle cx="4" cy="0" r="1.8" fill="#c084fc" />
      <circle cx="8" cy="3.5" r="1.8" fill="#c084fc" />
    </g>
    <text x="122" y="76" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="16" fill="#f8fafc" letter-spacing="1">SALLE D'ARCADE</text>
    <text x="122" y="96" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12.5" fill="#c084fc">8 Rétro &amp; Vectrex 1982</text>
    <text x="122" y="116" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="11" fill="#94a3b8">Émulateur Vectoriel Culte</text>
  </g>

  <!-- ==================== BOTTOM STATUS BAR ==================== -->
  <g transform="translate(600, 532)">
    <rect x="-245" y="-20" width="490" height="40" rx="20" fill="#0b1120" stroke="#1e293b" stroke-width="1.2" />
    
    <!-- Pulsing Emerald Live Indicator -->
    <circle cx="-195" cy="0" r="9" fill="#10b981" opacity="0.25" />
    <circle cx="-195" cy="0" r="4.5" fill="#10b981" />

    <text x="-175" y="4.5" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12.5" fill="#94a3b8" letter-spacing="2">
      EN LIGNE SUR
    </text>
    <text x="-60" y="4.5" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-weight="800" font-size="15" fill="#38bdf8" letter-spacing="0.5">
      https://hootindiegames.com
    </text>
  </g>
</svg>
`;

fs.writeFileSync(SVG_OUTPUT, svgContent, 'utf-8');
console.log(`✅ Generated ${SVG_OUTPUT}`);

// 3. Render SVG to PNG with Headless Chrome
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fileUrl = `file:///${SVG_OUTPUT.replace(/\\/g, '/')}`;

try {
  execSync(
    `powershell -Command "Start-Process '${chromePath}' -ArgumentList '--headless=new', '--screenshot=\\"${PNG_OUTPUT}\\"', '--window-size=1200,630', '--default-background-color=04060c', '${fileUrl}' -Wait"`,
    { stdio: 'inherit' }
  );
  console.log(`✅ Rendered PNG screenshot to ${PNG_OUTPUT}`);
} catch (err) {
  console.error('Failed to render with Chrome:', err);
}
