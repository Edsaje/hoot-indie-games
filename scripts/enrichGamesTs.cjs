const fs = require('fs');
const path = require('path');

const cacheFile = path.join(__dirname, 'steam_release_dates.json');
const gamesFile = path.join(__dirname, '../src/data/games.ts');

const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
const content = fs.readFileSync(gamesFile, 'utf-8');

const itchDates = {
  'celeste-classic-pico8': '2015-08-21',
  'adventures-with-anxiety': '2019-10-21',
  'blooming-panic': '2021-09-19'
};

const parts = content.split(/(?=\n  \{\n    "id": ")/);
console.log('Total parts:', parts.length);

let enriched = 0;
for (let i = 1; i < parts.length; i++) {
  const p = parts[i];
  const idMatch = p.match(/"id":\s*"([^"]+)"/);
  const steamMatch = p.match(/store\.steampowered\.com\/app\/(\d+)/);
  const yearMatch = p.match(/"releaseYear":\s*(\d+)/);
  if (!idMatch || !yearMatch) continue;

  const id = idMatch[1];
  const year = yearMatch[1];
  const appId = steamMatch ? steamMatch[1] : null;

  let date = appId && cache[appId] ? cache[appId] : itchDates[id];
  if (!date) {
    date = `${year}-01-01`;
  }

  // Remove any pre-existing releaseDate
  let updatedP = p.replace(/\n\s*"releaseDate":\s*"[^"]*",?/, '');

  // Add releaseDate right after releaseYear
  const target = `"releaseYear": ${year},`;
  const replacement = `"releaseYear": ${year},\n    "releaseDate": "${date}",`;
  if (updatedP.includes(target)) {
    updatedP = updatedP.replace(target, replacement);
    enriched++;
  } else {
    console.warn('Could not find target in game:', id);
  }
  parts[i] = updatedP;
}

console.log('Enriched games count:', enriched);
const finalContent = parts.join('');
fs.writeFileSync(gamesFile, finalContent, 'utf-8');
console.log('Successfully written to src/data/games.ts!');
