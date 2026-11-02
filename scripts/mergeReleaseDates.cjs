const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cacheFile = path.join(__dirname, 'steam_release_dates.json');
const part1File = path.join(__dirname, 'results_part1.json');
const part2File = path.join(__dirname, 'results_part2.json');
const part1RemFile = path.join(__dirname, 'results_part1_rem.json');
const catalogFile = path.join(__dirname, '../public/data/steam_catalog.json');

// Pull part 2 and remaining from VPS if reachable
try {
  console.log('Tentative de synchronisation des résultats VPS (/tmp/results_part2.json)...');
  execSync('scp -o ConnectTimeout=3 debian@51.83.77.28:/tmp/results_part2.json "' + part2File + '"', { stdio: 'ignore' });
  console.log('✓ Résultats part 2 VPS synchronisés !');
} catch (e) {
  console.warn('⚠️ Impossible de joindre le VPS pour part 2.');
}

try {
  execSync('scp -o ConnectTimeout=3 debian@51.83.77.28:/tmp/results_part1_remaining.json "' + part1RemFile + '"', { stdio: 'ignore' });
  console.log('✓ Résultats part 1 rem VPS synchronisés !');
} catch (e) {
  // Not ready yet
}

let cache = {};
if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  } catch {}
}

let added = 0;
if (fs.existsSync(part1File)) {
  try {
    const p1 = JSON.parse(fs.readFileSync(part1File, 'utf-8'));
    for (const [id, date] of Object.entries(p1)) {
      if (date && date !== 'UNKNOWN' && !cache[id]) {
        cache[id] = date;
        added++;
      }
    }
  } catch {}
}

if (fs.existsSync(part2File)) {
  try {
    const p2 = JSON.parse(fs.readFileSync(part2File, 'utf-8'));
    for (const [id, date] of Object.entries(p2)) {
      if (date && date !== 'UNKNOWN' && !cache[id]) {
        cache[id] = date;
        added++;
      }
    }
  } catch {}
}

if (fs.existsSync(part1RemFile)) {
  try {
    const p1rem = JSON.parse(fs.readFileSync(part1RemFile, 'utf-8'));
    for (const [id, date] of Object.entries(p1rem)) {
      if (date && date !== 'UNKNOWN' && !cache[id]) {
        cache[id] = date;
        added++;
      }
    }
  } catch {}
}

fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
console.log(`Cache mis à jour : ${Object.keys(cache).length} dates certifiées au total (+${added} nouvelles)`);

// Mise à jour de steam_catalog.json
if (fs.existsSync(catalogFile)) {
  const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
  let catalogUpdatedWithExact = 0;
  let catalogFallback = 0;

  for (const g of catalog) {
    const id = g.steamAppId || (g.steamUrl?.match(/\/app\/(\d+)/)?.[1]);
    if (id && cache[String(id)]) {
      g.releaseDate = cache[String(id)];
      catalogUpdatedWithExact++;
    } else if (g.releaseYear) {
      g.releaseDate = `${g.releaseYear}-01-01`;
      catalogFallback++;
    }
  }

  fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`✓ public/data/steam_catalog.json mis à jour !`);
  console.log(`  - ${catalogUpdatedWithExact} jeux avec date exacte (Jour/Mois/Année)`);
  console.log(`  - ${catalogFallback} jeux avec date repli (${catalogFallback > 0 ? 'Année-01-01' : '0'})`);
}
