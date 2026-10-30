# ==============================================================================
# Hoot Indie Games — Dockerfile Multi-Stage Haute Performance
# Stage 1 : Compilation du frontend React 19 / Vite / Tailwind v4
# Stage 2 : Serveur de production Apache + PHP 8.3 avec support des API souveraines
# ==============================================================================

# --- Stage 1: Build du Frontend Vite ---
FROM node:22-alpine AS builder

WORKDIR /app

# Cache des dépendances npm
COPY package*.json ./
RUN npm ci

# Copie des sources et compilation
COPY . .

# Argument pour injecter d'éventuelles clés publiques Supabase au build
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# --- Stage 2: Runtime Apache + PHP 8.3 ---
FROM php:8.3-apache

# Activation des modules Apache indispensables (réécritures SPA, compression, sécurité)
RUN a2enmod rewrite headers expires deflate mime

# Configuration de la directive AllowOverride pour prise en charge du .htaccess
RUN { \
        echo '<Directory /var/www/html>'; \
        echo '    Options -Indexes +FollowSymLinks'; \
        echo '    AllowOverride All'; \
        echo '    Require all granted'; \
        echo '</Directory>'; \
        echo 'PassEnv RESEND_API_KEY BREVO_API_KEY STEAM_API_KEY'; \
    } > /etc/apache2/conf-available/security-and-override.conf \
    && a2enconf security-and-override

WORKDIR /var/www/html

# Copie du build final depuis le stage 1
COPY --from=builder /app/dist/ /var/www/html/

# Création du dossier de stockage des sauvegardes et permissions www-data
RUN mkdir -p /var/www/html/api/user_saves \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/api/user_saves

EXPOSE 80

CMD ["apache2-foreground"]
