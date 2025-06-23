# Etap 1: Budowanie aplikacji Next.js
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
# Kopiuj pliki zależności i zainstaluj
COPY package.json package-lock.json* ./
RUN npm ci
# Kopiuj resztę plików aplikacji
COPY . .
# Uruchom build
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Etap 2: Finalny obraz produkcyjny
FROM python:3.11-slim-bookworm AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalacja zależności systemowych: bash dla skryptu nodesource i curl dla healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends bash curl ca-certificates gnupg && \
    rm -rf /var/lib/apt/lists/*

# Instalacja Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs

# Sprawdzenie instalacji
RUN node --version
RUN python3 --version

# Kopiowanie i instalacja zależności Python
COPY requirements-railway.txt .
RUN pip install --no-cache-dir -r requirements-railway.txt

# Utworzenie użytkownika
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Kopiowanie zbudowanej aplikacji z etapu 'builder'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Kopiowanie modeli i skryptów ML
COPY --chown=nextjs:nodejs models ./models
COPY --chown=nextjs:nodejs scripts ./scripts

# Ustawienie uprawnień dla skryptów
RUN chmod +x scripts/*.py

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"] 