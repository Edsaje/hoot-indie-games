import { INDIE_GAMES } from '../src/data/games';

async function testUrl(url: string): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) return { ok: true, status: res.status };
    
    // Some CDNs reject HEAD, try GET with range:
    if (res.status === 403 || res.status === 405) {
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 6000);
      const getRes = await fetch(url, {
        method: 'GET',
        signal: getController.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Range': 'bytes=0-1024',
        }
      });
      clearTimeout(getTimeoutId);
      return { ok: getRes.ok || getRes.status === 206, status: getRes.status };
    }

    return { ok: false, status: res.status };
  } catch (err: any) {
    return { ok: false, status: 0, error: err?.message || String(err) };
  }
}

async function run() {
  console.log(`Auditing images for ${INDIE_GAMES.length} games...`);

  const tasks: { game: string; type: string; url: string }[] = [];

  for (const game of INDIE_GAMES) {
    if (game.headerImage) {
      tasks.push({ game: game.title, type: 'headerImage', url: game.headerImage });
    }
    if (Array.isArray(game.screenshots)) {
      game.screenshots.forEach((url, i) => {
        tasks.push({ game: game.title, type: `screenshot[${i}]`, url });
      });
    }
  }

  console.log(`Total URLs to test: ${tasks.length}`);
  const CONCURRENCY = 20;
  let brokenCount = 0;
  let completed = 0;

  async function worker(items: typeof tasks) {
    while (items.length > 0) {
      const task = items.pop();
      if (!task) break;
      const res = await testUrl(task.url);
      completed++;
      if (!res.ok) {
        brokenCount++;
        console.log(`❌ [BROKEN] ${task.game} (${task.type}): ${task.url} -> Status: ${res.status} ${res.error ? `(${res.error})` : ''}`);
      }
    }
  }

  const pool = Array.from({ length: CONCURRENCY }, () => worker(tasks));
  await Promise.all(pool);

  console.log(`\nAudit completed! Tested ${completed} URLs. Broken: ${brokenCount}`);
}

run();
