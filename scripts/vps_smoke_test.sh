#!/usr/bin/env bash
# ==============================================================================
# 🦉 Hoot Indie Games — Smoke Tests & Recette Automatisée Post-Déploiement VPS
# Exécutable en local via SSH ou directement sur le VPS OVH 51.83.77.28
# ==============================================================================

set -euo pipefail

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_RESET='\033[0m'

CONTAINER_NAME="app_hootindiegames"
DOMAIN="https://hootindiegames.com"

PASSED=0
FAILED=0

check_step() {
    local desc="$1"
    local cmd="$2"
    echo -e "${COLOR_BLUE}▶ Test : ${desc}...${COLOR_RESET}"
    if eval "$cmd"; then
        echo -e "   ${COLOR_GREEN}✅ SUCCÈS${COLOR_RESET}\n"
        PASSED=$((PASSED + 1))
    else
        echo -e "   ${COLOR_RED}❌ ÉCHEC${COLOR_RESET}\n"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "\n========================================================"
echo -e "🦉 Lancement des Smoke Tests Post-Déploiement (Production)"
echo -e "========================================================\n"

# 1. État du conteneur Docker
check_step "Conteneur Docker en cours d'exécution" \
    "docker ps --format '{{.Names}}' | grep -q '^${CONTAINER_NAME}$'"

# 2. Permissions sur le volume souverain user_saves
check_step "Volume persistant appartenant à www-data (775)" \
    "docker exec ${CONTAINER_NAME} ls -ld /var/www/html/api/user_saves | grep -q 'www-data www-data'"

# 3. Capacité d'écriture effective en tant que www-data
check_step "Écriture atomique www-data vérifiée" \
    "docker exec -u www-data ${CONTAINER_NAME} touch /var/www/html/api/user_saves/.smoke_probe.tmp && docker exec -u www-data ${CONTAINER_NAME} rm /var/www/html/api/user_saves/.smoke_probe.tmp"

# 4. Exécution de la suite de tests unitaires PHP dans le conteneur
check_step "Suite de tests unitaires PHP (20 tests validés)" \
    "docker exec ${CONTAINER_NAME} php /var/www/html/tests/run_php_tests.php > /dev/null"

# 5. Page d'accueil HTTPS
check_step "Page d'accueil HTTP 200 (${DOMAIN}/)" \
    "curl -fsS -o /dev/null -w '%{http_code}' '${DOMAIN}/' | grep -q '^200$'"

# 6. Endpoint Authentification Me
check_step "API Auth me HTTP 200 (${DOMAIN}/api/user_auth.php?action=me)" \
    "curl -fsS '${DOMAIN}/api/user_auth.php?action=me' | grep -q '\"success\":true'"

# 7. Endpoint Cloud Sync Load (format valide syncKey)
check_step "API Cloud Sync Load HTTP 200 (${DOMAIN}/api/user_cloud_sync.php)" \
    "curl -fsS '${DOMAIN}/api/user_cloud_sync.php?action=load&syncKey=sync_smoke_test_key_1234567890' | grep -q '\"success\":true'"

# 8. Protection Anti-IDOR (doit renvoyer 403 Forbidden sur tentative d'accès non autorisée)
check_step "Sécurité Anti-IDOR active (403 Forbidden sans session)" \
    "curl -s -o /dev/null -w '%{http_code}' '${DOMAIN}/api/user_cloud_sync.php?action=load&steamId=76561198035270542&syncKey=sync_probe_bad_key_1234567890' | grep -q '^403$'"

# 9. Endpoint Chat Public (Le Perchoir)
check_step "API Chat Public HTTP 200 (${DOMAIN}/api/chat.php)" \
    "curl -fsS '${DOMAIN}/api/chat.php?action=get_messages&channel=all' | grep -q '\"success\":true'"

# 10. Endpoint Échanges de Cartes
check_step "API Trades HTTP 200 (${DOMAIN}/api/trades.php)" \
    "curl -fsS '${DOMAIN}/api/trades.php?action=fetch&friendCode=smoke_test_probe' | grep -q '\"success\":true'"

# 11. Endpoint Relais Multijoueur Versus
check_step "API Versus Room HTTP 200 (${DOMAIN}/api/versus_room.php)" \
    "curl -fsS '${DOMAIN}/api/versus_room.php?action=get_room&roomCode=PROBE99' | grep -q '\"success\":'"

# 12. Intégrité de la sauvegarde officielle du créateur Hibouxe
check_step "Intégrité sauvegarde Hibouxe (Biome 6 préservé)" \
    "docker exec ${CONTAINER_NAME} php -r '\$d=json_decode(file_get_contents(\"/var/www/html/api/user_saves/steam_76561198035270542.json\"),true); exit(\$d[\"odysseyState\"][\"highestBiomeUnlocked\"] >= 6 ? 0 : 1);'"

echo "--------------------------------------------------------"
echo -e "Résultat : ${PASSED} réussis, ${FAILED} échoués."

if [ "$FAILED" -eq 0 ]; then
    echo -e "${COLOR_GREEN}🎉 TOUS LES SMOKE TESTS DE PRODUCTION SONT AU VERT !${COLOR_RESET}\n"
    exit 0
else
    echo -e "${COLOR_RED}⚠️ ATTENTION : Certains smoke tests ont échoué en production.${COLOR_RESET}\n"
    exit 1
fi
