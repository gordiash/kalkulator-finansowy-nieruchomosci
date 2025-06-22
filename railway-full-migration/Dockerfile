# Etap 1: Instalacja zależności Node.js
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Etap 2: Budowanie aplikacji Next.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Etap 3: Przygotowanie środowiska Python
FROM python:3.11-slim AS python-env
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ && rm -rf /var/lib/apt/lists/*
COPY requirements-railway.txt .
RUN pip install --no-cache-dir -r requirements-railway.txt

# Etap 4: Finalny obraz produkcyjny
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Utwórz dedykowanego użytkownika
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiuj zbudowaną aplikację Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Kopiuj środowisko Python
COPY --from=python-env /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-env /usr/local/bin /usr/local/bin
RUN apk add --no-cache python3 py3-pip

# Kopiuj modele i skrypty ML
COPY --chown=nextjs:nodejs models ./models
COPY --chown=nextjs:nodejs scripts ./scripts

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"] 