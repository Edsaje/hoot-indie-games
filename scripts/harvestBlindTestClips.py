import os
import subprocess
import sys

# Ensure UTF-8 stdout on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

TRACKS = [
    {"game_id": "undertale", "query": "Undertale Megalovania official ost"},
    {"game_id": "celeste", "query": "Celeste First Steps Lena Raine official"},
    {"game_id": "hollow-knight", "query": "Hollow Knight Dirtmouth Christopher Larkin official"},
    {"game_id": "outer-wilds", "query": "Outer Wilds Timber Hearth Andrew Prahlow official ost"},
    {"game_id": "shovel-knight", "query": "Shovel Knight Strike the Earth Jake Kaufman official"},
    {"game_id": "hotline-miami", "query": "Hotline Miami Hydrogen MOON official"},
    {"game_id": "hades", "query": "Hades No Escape Darren Korb official ost"},
    {"game_id": "stardew-valley", "query": "Stardew Valley Overture ConcernedApe official"},
    {"game_id": "balatro", "query": "Balatro Main Theme official ost"},
    {"game_id": "sea-of-stars", "query": "Sea of Stars Dance of 1000 Suns official ost"},
    {"game_id": "gris", "query": "GRIS Pt 1 Berlinist official ost"},
    {"game_id": "slay-the-spire", "query": "Slay the Spire The City Clark Aboud official ost"},
    {"game_id": "cuphead", "query": "Cuphead Inkwell Isle One Kristofer Maddigan official"},
    {"game_id": "dead-cells", "query": "Dead Cells Prisoners Awakening Yoann Laulan official"},
    {"game_id": "tunic", "query": "TUNIC Memories of Memories Lifeformed official"},
    {"game_id": "fez", "query": "FEZ Continuum Disasterpeace official ost"},
    {"game_id": "katana-zero", "query": "Katana Zero Sneaky Driver Bill Kiley official"},
    {"game_id": "the-binding-of-isaac-rebirth", "query": "The Binding of Isaac Rebirth Genesis 22 10 Ridiculon official"},
    {"game_id": "hyper-light-drifter", "query": "Hyper Light Drifter Vignette Panacea Disasterpeace official"},
    {"game_id": "terraria", "query": "Terraria Overworld Day Scott Lloyd Shelly official"},
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "blindtest")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"🎵 Téléchargement et découpe de {len(TRACKS)} pistes audio pour le Blind Test...")

for i, track in enumerate(TRACKS, 1):
    gid = track["game_id"]
    query = track["query"]
    target_mp3 = os.path.join(OUTPUT_DIR, f"{gid}.mp3")

    if os.path.exists(target_mp3) and os.path.getsize(target_mp3) > 10000:
        print(f"[{i}/{len(TRACKS)}] ✅ Déjà présent : {gid}.mp3 ({os.path.getsize(target_mp3)} octets)")
        continue

    print(f"[{i}/{len(TRACKS)}] 📥 Récupération : {gid} ({query})...")
    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        f"ytsearch1:{query}",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "128k",
        "--download-sections",
        "*00:00-00:20",
        "--force-keyframes-at-cuts",
        "-o",
        os.path.join(OUTPUT_DIR, f"{gid}.%(ext)s"),
        "--no-playlist",
        "--quiet",
        "--no-warnings",
    ]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=40)
        if os.path.exists(target_mp3):
            print(f"    ✨ Succès : {gid}.mp3 créé ({os.path.getsize(target_mp3)} octets)")
        else:
            print(f"    ⚠️ Erreur pour {gid}: {res.stderr[:200] if res.stderr else 'Fichier non créé'}")
    except Exception as e:
        print(f"    ❌ Exception pour {gid}: {e}")

print("🏁 Traitement terminé !")
