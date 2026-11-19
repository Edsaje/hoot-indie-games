#!/bin/sh
set -e

# Garantir les permissions www-data sur le volume persistant monté
mkdir -p /var/www/html/api/user_saves
chown -R www-data:www-data /var/www/html/api/user_saves
chmod -R 775 /var/www/html/api/user_saves

exec "$@"
