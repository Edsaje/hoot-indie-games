import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const roostDir = path.resolve('public/roost');
if (!fs.existsSync(roostDir)) {
  fs.mkdirSync(roostDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function captureUrl(url: string, outputPath: string, width = 1200, height = 675) {
  const absOut = path.resolve(outputPath);
  const cmd = `powershell -Command "Start-Process '${chromePath}' -ArgumentList '--headless=new', '--screenshot=\\"${absOut}\\"', '--window-size=${width},${height}', '${url}' -Wait"`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Captured ${url} -> ${outputPath}`);
  } catch (err) {
    console.error(`❌ Failed capturing ${url}:`, err);
  }
}

async function main() {
  // 1. Capture Quentin Beaud Portfolio
  captureUrl('https://quentinbeaud.com/', 'public/roost/portfolio_quentin.png');

  // 2. We already downloaded Torneko banner, let's verify it
  if (fs.existsSync('public/roost/torneko_guide_banner.jpg')) {
    console.log('✅ Torneko banner is present');
  }

  console.log('All captures executed.');
}

main();
