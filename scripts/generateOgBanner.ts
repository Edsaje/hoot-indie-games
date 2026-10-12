import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';

const LOGO_PATH = path.resolve('public/logo-512.png');
const SVG_OUTPUT = path.resolve('public/og-banner.svg');
const PNG_OUTPUT = path.resolve('public/og-banner.png');

// 1. Read base64 data of official logo
const logoBuffer = fs.readFileSync(LOGO_PATH);
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

// 2. Botanical ivy corner SVG definition
const cornerIvySvg = `
  <g class="ivy-corner">
    <!-- Vine shadow underneath -->
    <path d="M 2 80 L 2 32 A 30 30 0 0 1 32 2 L 80 2" stroke="#011f17" stroke-width="5" stroke-linecap="round" opacity="0.75" />
    <!-- Secondary organic runner weaving around -->
    <path d="M 1 80 C 4 68, 4 54, 1.5 42 C -0.8 32, 4 24, 9 19 C 14 14, 20 9, 28 6 C 36 3, 44 -1, 56 1.5 C 68 4, 74 4, 80 1" stroke="#047857" stroke-width="2.6" stroke-linecap="round" />
    <path d="M 1 80 C 4 68, 4 54, 1.5 42 C -0.8 32, 4 24, 9 19 C 14 14, 20 9, 28 6 C 36 3, 44 -1, 56 1.5 C 68 4, 74 4, 80 1" stroke="#6ee7b7" stroke-width="1.0" stroke-linecap="round" opacity="0.8" />
    
    <!-- Wood wrapping coil loops -->
    <path d="M 4 72 C -3 74, -3 66, 2 63" stroke="#047857" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 3 71 C -1 72, -1 67, 2 64" stroke="#34d399" stroke-width="1" stroke-linecap="round" opacity="0.85" />
    <path d="M 72 4 C 74 -3, 66 -3, 63 2" stroke="#047857" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 71 3 C 72 -1, 67 -1, 64 2" stroke="#34d399" stroke-width="1" stroke-linecap="round" opacity="0.85" />

    <!-- Core vine backbone -->
    <path d="M 2 80 L 2 32 A 30 30 0 0 1 32 2 L 80 2" stroke="#047857" stroke-width="3.8" stroke-linecap="round" />
    <path d="M 2 80 L 2 32 A 30 30 0 0 1 32 2 L 80 2" stroke="#34d399" stroke-width="1.4" stroke-linecap="round" opacity="0.9" />

    <!-- Apex Tendril -->
    <path d="M 12 12 Q 22 22 20 28 Q 16 32 13 26 Q 11 21 16 23" stroke="#059669" stroke-width="2" stroke-linecap="round" />
    <path d="M 12 12 Q 22 22 20 28" stroke="#34d399" stroke-width="1" stroke-linecap="round" opacity="0.75" />

    <!-- Vegetal nodes -->
    <circle cx="2" cy="60" r="2.4" fill="#047857" />
    <circle cx="2" cy="60" r="1.2" fill="#34d399" />
    <circle cx="60" cy="2" r="2.4" fill="#047857" />
    <circle cx="60" cy="2" r="1.2" fill="#34d399" />
    <circle cx="12" cy="12" r="2.6" fill="#065f46" />
    <circle cx="12" cy="12" r="1.3" fill="#34d399" opacity="0.85" />

    <!-- Leaf 1: Horizontal Emerald Leaf -->
    <g transform="translate(62, -18) rotate(15)">
      <!-- Leaf shadow -->
      <path d="M 15 32 C 8 26 2 19 2 11 C 2 3 9 1 15 1 C 21 1 28 3 28 11 C 28 19 22 26 15 32 Z" fill="#064e3b" />
      <!-- Leaf body -->
      <path d="M 15 30 C 9 25 4 19 4 11 C 4 4 10 2 15 2 C 20 2 26 4 26 11 C 26 19 21 25 15 30 Z" fill="#059669" />
      <!-- Facet highlight -->
      <path d="M 15 3 C 10 3 5 6 5 12 C 5 18 10 24 15 28 Z" fill="#34d399" opacity="0.4" />
      <!-- Vein -->
      <line x1="15" y1="3" x2="15" y2="30" stroke="#a7f3d0" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
      <!-- Stem -->
      <path d="M 15 30 Q 15 38 10 44" stroke="#047857" stroke-width="2.2" stroke-linecap="round" />
      <!-- Dewdrop -->
      <circle cx="11" cy="9" r="1.4" fill="#ffffff" opacity="0.75" />
    </g>

    <!-- Leaf 2: Vertical Moss Leaf -->
    <g transform="translate(-18, 62) rotate(-75)">
      <path d="M 15 32 C 8 26 2 19 2 11 C 2 3 9 1 15 1 C 21 1 28 3 28 11 C 28 19 22 26 15 32 Z" fill="#14532d" />
      <path d="M 15 30 C 9 25 4 19 4 11 C 4 4 10 2 15 2 C 20 2 26 4 26 11 C 26 19 21 25 15 30 Z" fill="#15803d" />
      <path d="M 15 3 C 10 3 5 6 5 12 C 5 18 10 24 15 28 Z" fill="#4ade80" opacity="0.4" />
      <line x1="15" y1="3" x2="15" y2="30" stroke="#bbf7d0" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
      <path d="M 15 30 Q 15 38 10 44" stroke="#047857" stroke-width="2.2" stroke-linecap="round" />
    </g>

    <!-- Leaf 3: Corner Golden Ivy Leaf -->
    <g transform="translate(14, -8) rotate(-40)">
      <path d="M 15 30 C 9 25 3 18 3 10 C 3 3 10 1 15 1 C 20 1 27 3 27 10 C 27 18 21 25 15 30 Z" fill="#78350f" />
      <path d="M 15 28 C 10 24 5 17 5 10 C 5 4 10 2 15 2 C 20 2 25 4 25 10 C 25 17 20 24 15 28 Z" fill="#d97706" />
      <path d="M 15 3 C 11 3 6 6 6 11 C 6 16 11 22 15 26 Z" fill="#fbbf24" opacity="0.45" />
      <line x1="15" y1="3" x2="15" y2="28" stroke="#fef3c7" stroke-width="1.2" stroke-linecap="round" opacity="0.85" />
      <path d="M 15 28 Q 14 34 8 38" stroke="#78350f" stroke-width="2" stroke-linecap="round" />
      <circle cx="11" cy="9" r="1.3" fill="#ffffff" opacity="0.8" />
    </g>
  </g>
`;

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradients: Forest Sanctuary Night -->
    <radialGradient id="sanctuaryCanopy" cx="50%" cy="22%" r="75%">
      <stop offset="0%" stop-color="#0a2a1f" stop-opacity="1" />
      <stop offset="35%" stop-color="#051a13" stop-opacity="1" />
      <stop offset="70%" stop-color="#02100b" stop-opacity="1" />
      <stop offset="100%" stop-color="#010604" stop-opacity="1" />
    </radialGradient>
    
    <!-- Warm Golden Moonbeam & Sanctuary Lantern Aura -->
    <radialGradient id="amberCanopyGlow" cx="50%" cy="16%" r="52%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.32" />
      <stop offset="30%" stop-color="#d97706" stop-opacity="0.18" />
      <stop offset="65%" stop-color="#78350f" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <!-- Side Emerald Mist Auras -->
    <radialGradient id="emeraldAuraLeft" cx="8%" cy="75%" r="45%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#059669" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#010604" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="emeraldAuraRight" cx="92%" cy="75%" r="45%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#059669" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#010604" stop-opacity="0" />
    </radialGradient>

    <!-- Owl Mascot Halo -->
    <radialGradient id="owlHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.5" />
      <stop offset="30%" stop-color="#f59e0b" stop-opacity="0.35" />
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

    <!-- Wood Bark Borders -->
    <linearGradient id="woodBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#92400e" />
      <stop offset="50%" stop-color="#78350f" />
      <stop offset="100%" stop-color="#451a03" />
    </linearGradient>

    <!-- Pillar Cards Gradients -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#082b20" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#031610" stop-opacity="0.98" />
    </linearGradient>

    <!-- 4 Distinct Pillar Card Border Accents -->
    <linearGradient id="borderAmber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#78350f" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="borderEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#064e3b" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="borderLime" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a3e635" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#365314" stop-opacity="0.4" />
    </linearGradient>
    <linearGradient id="borderPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#581c87" stop-opacity="0.4" />
    </linearGradient>
  </defs>

  <!-- ==================== 1. BASE CANOPY BACKGROUND ==================== -->
  <rect width="1200" height="630" fill="#010604" />
  <rect width="1200" height="630" fill="url(#sanctuaryCanopy)" />
  <rect width="1200" height="630" fill="url(#amberCanopyGlow)" />
  <rect width="1200" height="630" fill="url(#emeraldAuraLeft)" />
  <rect width="1200" height="630" fill="url(#emeraldAuraRight)" />

  <!-- Bioluminescent Forest Spores & Fireflies (Lucioles Sylvestres) -->
  <g opacity="0.75">
    <circle cx="85" cy="75" r="1.5" fill="#fef08a" opacity="0.9" />
    <circle cx="160" cy="140" r="2" fill="#34d399" opacity="0.8" />
    <circle cx="270" cy="65" r="2.5" fill="#f59e0b" opacity="0.7" />
    <circle cx="390" cy="110" r="2" fill="#ffffff" opacity="0.8" />
    <circle cx="810" cy="95" r="2" fill="#a7f3d0" opacity="0.8" />
    <circle cx="930" cy="60" r="2.5" fill="#fde68a" opacity="0.9" />
    <circle cx="1050" cy="130" r="2" fill="#34d399" opacity="0.8" />
    <circle cx="1125" cy="80" r="1.5" fill="#fef08a" opacity="0.7" />
    
    <circle cx="55" cy="270" r="2" fill="#34d399" opacity="0.7" />
    <circle cx="1145" cy="290" r="2" fill="#fbbf24" opacity="0.7" />
    <circle cx="100" cy="515" r="2" fill="#6ee7b7" opacity="0.7" />
    <circle cx="1100" cy="530" r="2.5" fill="#f59e0b" opacity="0.75" />

    <!-- Radiant Fireflies with Soft Halos -->
    <circle cx="210" cy="195" r="3" fill="#34d399" opacity="0.85" />
    <circle cx="210" cy="195" r="9" fill="#34d399" opacity="0.2" />
    <circle cx="990" cy="185" r="3" fill="#fbbf24" opacity="0.85" />
    <circle cx="990" cy="185" r="9" fill="#fbbf24" opacity="0.2" />
    <circle cx="140" cy="415" r="3.5" fill="#10b981" opacity="0.7" />
    <circle cx="140" cy="415" r="10" fill="#10b981" opacity="0.18" />
    <circle cx="1060" cy="425" r="3.5" fill="#fde68a" opacity="0.7" />
    <circle cx="1060" cy="425" r="10" fill="#fde68a" opacity="0.18" />
  </g>

  <!-- ==================== 2. SANCTUARY FRAMING ==================== -->
  <!-- Outer Ancient Wood Frame -->
  <rect x="18" y="18" width="1164" height="594" rx="24" fill="none" stroke="url(#woodBorder)" stroke-width="3.5" />
  <!-- Inner Emerald Vine Hairline -->
  <rect x="28" y="28" width="1144" height="574" rx="18" fill="none" stroke="#047857" stroke-width="1.8" opacity="0.75" />
  <rect x="34" y="34" width="1132" height="562" rx="14" fill="none" stroke="url(#goldGradient)" stroke-width="1" opacity="0.35" />

  <!-- Corner Gold Brackets -->
  <path d="M18 64 V38 A20 20 0 0 1 38 18 H64" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <path d="M1136 18 H1162 A20 20 0 0 1 1182 38 V64" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <path d="M18 566 V592 A20 20 0 0 0 38 612 H64" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
  <path d="M1136 612 H1162 A20 20 0 0 0 1182 592 V566" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />

  <!-- ==================== 3. BOTANICAL IVY VINES IN 4 CORNERS ==================== -->
  <!-- Top-Left Corner -->
  <g transform="translate(18, 18)">
    ${cornerIvySvg}
  </g>
  <!-- Top-Right Corner -->
  <g transform="translate(1182, 18) scale(-1, 1)">
    ${cornerIvySvg}
  </g>
  <!-- Bottom-Left Corner -->
  <g transform="translate(18, 612) scale(1, -1)">
    ${cornerIvySvg}
  </g>
  <!-- Bottom-Right Corner -->
  <g transform="translate(1182, 612) scale(-1, -1)">
    ${cornerIvySvg}
  </g>

  <!-- ==================== 4. CENTER MASCOT EMBLEM ==================== -->
  <!-- Radiant Aura Behind Owl -->
  <circle cx="600" cy="112" r="130" fill="url(#owlHalo)" />
  <!-- Sacred Medallion Circle -->
  <circle cx="600" cy="112" r="74" fill="#041f17" stroke="url(#woodBorder)" stroke-width="2.5" />
  <circle cx="600" cy="112" r="69" fill="none" stroke="url(#goldGradient)" stroke-width="1.2" opacity="0.8" />

  <!-- Official Hibouxe Mascot Logo Image (140x140) -->
  <image href="${logoBase64}" x="530" y="42" width="140" height="140" preserveAspectRatio="xMidYMid meet" />

  <!-- ==================== 5. BRAND TITLES ==================== -->
  <text x="600" y="222" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Montserrat', sans-serif" font-weight="900" font-size="44" letter-spacing="4">
    <tspan fill="#f8fafc">HOOT </tspan>
    <tspan fill="url(#goldGradient)">INDIE </tspan>
    <tspan fill="#f8fafc">GAMES</tspan>
  </text>

  <!-- Brand Mission Subtitle with Glowing Accent -->
  <text x="600" y="254" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="16" fill="url(#goldGradient)" letter-spacing="3.5">
    ✨ LE SANCTUAIRE DES JEUX VIDÉO INDÉPENDANTS ✨
  </text>

  <!-- Summary Micro-line with accurate numbers & features -->
  <text x="600" y="282" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="13.5" fill="#cbd5e1" letter-spacing="0.5">
    300+ Pépites Steam Certifiées • Classeur Sylvestre &amp; Boosters • 17+ Mini-Jeux • Salle d'Arcade 1982
  </text>

  <!-- ==================== 6. THE 4 PILLARS (SYLVESTRE DA CARDS) ==================== -->
  
  <!-- Card 1: 300+ Pépites Steam (Amber/Gold Theme) -->
  <g transform="translate(68, 308)">
    <rect width="248" height="144" rx="16" fill="url(#cardGrad)" stroke="url(#borderAmber)" stroke-width="1.8" />
    <rect x="25" y="0" width="198" height="2.5" rx="1.2" fill="#f59e0b" opacity="0.9" />
    <!-- 3D Gem Vector -->
    <g transform="translate(124, 35)">
      <circle cx="0" cy="0" r="19" fill="#f59e0b" opacity="0.14" />
      <polygon points="0,-13 12,-4 8,12 -8,12 -12,-4" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linejoin="round" />
      <polygon points="0,-13 5,-4 0,12 -5,-4" fill="none" stroke="#f59e0b" stroke-width="1.6" />
      <line x1="-12" y1="-4" x2="12" y2="-4" stroke="#fbbf24" stroke-width="1.6" />
    </g>
    <text x="124" y="80" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#fef3c7" letter-spacing="1">300+ PÉPITES</text>
    <text x="124" y="101" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12.5" fill="#fbbf24">Catalogue Certifié Steam</text>
    <text x="124" y="122" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">Fiches, Avis &amp; OST Audio</text>
  </g>

  <!-- Card 2: Classeur Sylvestre (Emerald/Forest Theme) -->
  <g transform="translate(340, 308)">
    <rect width="248" height="144" rx="16" fill="url(#cardGrad)" stroke="url(#borderEmerald)" stroke-width="1.8" />
    <rect x="25" y="0" width="198" height="2.5" rx="1.2" fill="#10b981" opacity="0.9" />
    <!-- 3D Card / Binder Vector -->
    <g transform="translate(124, 35)">
      <circle cx="0" cy="0" r="19" fill="#10b981" opacity="0.14" />
      <rect x="-10" y="-12" width="20" height="25" rx="3" fill="none" stroke="#34d399" stroke-width="2" />
      <rect x="-6" y="-8" width="12" height="10" rx="1.5" fill="#10b981" opacity="0.35" />
      <path d="M-6 8 L6 8" stroke="#6ee7b7" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="0" cy="-3" r="2" fill="#fef08a" />
    </g>
    <text x="124" y="80" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#ecfdf5" letter-spacing="0.5">CLASSEUR SYLVESTRE</text>
    <text x="124" y="101" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12.5" fill="#34d399">Cartes 3D &amp; Boosters</text>
    <text x="124" y="122" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">Collection Sans Microachat</text>
  </g>

  <!-- Card 3: 17+ Mini-Jeux & Défis (Lime/Gold Theme) -->
  <g transform="translate(612, 308)">
    <rect width="248" height="144" rx="16" fill="url(#cardGrad)" stroke="url(#borderLime)" stroke-width="1.8" />
    <rect x="25" y="0" width="198" height="2.5" rx="1.2" fill="#84cc16" opacity="0.9" />
    <!-- Target / Controller Vector -->
    <g transform="translate(124, 35)">
      <circle cx="0" cy="0" r="19" fill="#84cc16" opacity="0.14" />
      <circle cx="0" cy="0" r="13" fill="none" stroke="#a3e635" stroke-width="2" />
      <circle cx="0" cy="0" r="7.5" fill="none" stroke="#84cc16" stroke-width="1.8" />
      <circle cx="0" cy="0" r="3" fill="#fef08a" />
      <line x1="0" y1="-17" x2="0" y2="-12" stroke="#a3e635" stroke-width="2" stroke-linecap="round" />
      <line x1="0" y1="12" x2="0" y2="17" stroke="#a3e635" stroke-width="2" stroke-linecap="round" />
      <line x1="-17" y1="0" x2="-12" y2="0" stroke="#a3e635" stroke-width="2" stroke-linecap="round" />
      <line x1="12" y1="0" x2="17" y2="0" stroke="#a3e635" stroke-width="2" stroke-linecap="round" />
    </g>
    <text x="124" y="80" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#f7fee7" letter-spacing="0.5">17+ MINI-JEUX</text>
    <text x="124" y="101" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12.5" fill="#a3e635">9 Défis du Jour à Minuit</text>
    <text x="124" y="122" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">Screenle, OST, Trivia &amp; 1v1</text>
  </g>

  <!-- Card 4: Salle d'Arcade (Purple/Synth Theme) -->
  <g transform="translate(884, 308)">
    <rect width="248" height="144" rx="16" fill="url(#cardGrad)" stroke="url(#borderPurple)" stroke-width="1.8" />
    <rect x="25" y="0" width="198" height="2.5" rx="1.2" fill="#c084fc" opacity="0.9" />
    <!-- Arcade Joystick Vector -->
    <g transform="translate(124, 35)">
      <circle cx="0" cy="0" r="19" fill="#c084fc" opacity="0.14" />
      <rect x="-12" y="-7" width="24" height="19" rx="3" fill="none" stroke="#c084fc" stroke-width="2" />
      <line x1="-4" y1="-7" x2="-4" y2="-13" stroke="#c084fc" stroke-width="2" stroke-linecap="round" />
      <circle cx="-4" cy="-14" r="3.2" fill="#f472b6" />
      <circle cx="4" cy="0" r="1.8" fill="#c084fc" />
      <circle cx="8" cy="3.5" r="1.8" fill="#c084fc" />
    </g>
    <text x="124" y="80" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="16" fill="#faf5ff" letter-spacing="0.5">SALLE D'ARCADE</text>
    <text x="124" y="101" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12.5" fill="#c084fc">8 Bornes &amp; Mine Storm</text>
    <text x="124" y="122" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="11" fill="#94a3b8">Vectrex Culte, Snake, Tetris</text>
  </g>

  <!-- ==================== 7. BOTTOM STATUS BAR ==================== -->
  <g transform="translate(600, 520)">
    <rect x="-260" y="-19" width="520" height="38" rx="19" fill="#031710" stroke="url(#woodBorder)" stroke-width="1.5" />
    <rect x="-258" y="-17" width="516" height="34" rx="17" fill="none" stroke="#047857" stroke-width="1" opacity="0.6" />
    
    <!-- Pulsing Emerald Live Indicator -->
    <circle cx="-215" cy="0" r="9" fill="#10b981" opacity="0.25" />
    <circle cx="-215" cy="0" r="4.5" fill="#34d399" />

    <text x="0" y="4.5" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="12.5" letter-spacing="1">
      <tspan fill="#a7f3d0">SANCTUAIRE EN ACCÈS LIBRE • </tspan>
      <tspan fill="#fbbf24" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="13.5">https://hootindiegames.com</tspan>
    </text>
  </g>
</svg>`;

// Write SVG
fs.writeFileSync(SVG_OUTPUT, svgContent, 'utf-8');
console.log(`✅ Generated ${SVG_OUTPUT}`);

// 3. Cross-platform Render SVG to PNG (Sharp with Chrome fallback)
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
      execSync(`google-chrome --headless=new --screenshot="${PNG_OUTPUT}" --window-size=1200,630 --default-background-color=010604 "${fileUrl}"`, { stdio: 'inherit' });
      console.log(`✅ Rendered PNG screenshot with google-chrome to ${PNG_OUTPUT}`);
    } catch (chromeErr) {
      console.error('All rendering options failed:', chromeErr);
    }
  }
}

renderPng();
