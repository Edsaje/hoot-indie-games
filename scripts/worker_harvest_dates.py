import sys
import os
import json
import time
import re
import urllib.request
import urllib.error

MONTHS = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
    'janv': 1, 'févr': 2, 'fevr': 2, 'mars': 3, 'avr': 4, 'mai': 5, 'juin': 6,
    'juil': 7, 'août': 8, 'aout': 8, 'sept': 9, 'oct': 10, 'nov': 11, 'déc': 12, 'dec': 12
}

def parse_steam_date(date_str):
    if not date_str or not isinstance(date_str, str):
        return None
    clean = date_str.strip()

    # '24 Feb, 2017' or '24 Feb 2017'
    m = re.match(r'^(\d{1,2})\s+([a-zA-ZÀ-ÿ.]+)\,?\s+(\d{4})$', clean)
    if m:
        day = int(m.group(1))
        m_raw = m.group(2).replace('.', '').lower()[:4]
        month = MONTHS.get(m_raw) or MONTHS.get(m_raw[:3])
        year = int(m.group(3))
        if month and year:
            return f"{year:04d}-{month:02d}-{day:02d}"

    # 'Feb 24, 2017'
    m = re.match(r'^([a-zA-ZÀ-ÿ.]+)\s+(\d{1,2})\,?\s+(\d{4})$', clean)
    if m:
        m_raw = m.group(1).replace('.', '').lower()[:4]
        month = MONTHS.get(m_raw) or MONTHS.get(m_raw[:3])
        day = int(m.group(2))
        year = int(m.group(3))
        if month and year:
            return f"{year:04d}-{month:02d}-{day:02d}"

    # 'Feb 2017'
    m = re.match(r'^([a-zA-ZÀ-ÿ.]+)\s+(\d{4})$', clean)
    if m:
        m_raw = m.group(1).replace('.', '').lower()[:4]
        month = MONTHS.get(m_raw) or MONTHS.get(m_raw[:3])
        year = int(m.group(2))
        if month and year:
            return f"{year:04d}-{month:02d}-01"

    # '2017'
    m = re.match(r'^(\d{4})$', clean)
    if m:
        return f"{m.group(1)}-01-01"

    return None

def fetch_date(app_id, retries=5):
    url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&filters=release_date&l=english"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
    )

    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    entry = data.get(str(app_id), {})
                    if entry.get("success"):
                        raw_date = entry.get("data", {}).get("release_date", {}).get("date")
                        return parse_steam_date(raw_date)
                    return None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait_sec = 30 + attempt * 10
                print(f"⏳ [HTTP 429] Rate limit sur {app_id}, pause de {wait_sec}s (tentative {attempt}/{retries})...", flush=True)
                time.sleep(wait_sec)
                continue
            else:
                print(f"⚠️ HTTP Error {e.code} pour {app_id}", flush=True)
                return None
        except Exception as e:
            time.sleep(1)
    return None

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 worker_harvest_dates.py <input_ids.json> <output_cache.json> [delay_ms]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    delay_ms = int(sys.argv[3]) if len(sys.argv) > 3 else 350
    delay_sec = delay_ms / 1000.0

    with open(input_file, 'r', encoding='utf-8') as f:
        app_ids = json.load(f)

    results = {}
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                results = json.load(f)
        except Exception:
            results = {}

    to_process = [aid for aid in app_ids if str(aid) not in results]
    print(f"Total: {len(app_ids)} | Déjà traités: {len(results)} | À traiter: {len(to_process)}", flush=True)

    count = 0
    for app_id in to_process:
        iso_date = fetch_date(app_id)
        if iso_date:
            results[str(app_id)] = iso_date
        else:
            results[str(app_id)] = "UNKNOWN"

        count += 1
        if count % 10 == 0 or count == len(to_process):
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2)
            print(f"Progression: {count}/{len(to_process)} ({len(results)} total en cache)", flush=True)

        time.sleep(delay_sec)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print("✅ Terminé avec succès !", flush=True)

if __name__ == '__main__':
    main()
