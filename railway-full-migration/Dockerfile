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

# Etap 3: Finalny obraz produkcyjny z Python
FROM python:3.11-slim AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instaluj Node.js w obrazie Python
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get update && apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Instaluj zależności Python
COPY requirements-railway.txt .
RUN pip install --no-cache-dir -r requirements-railway.txt

# Sprawdź czy Python działa
RUN python3 --version && \
    python3 -c "import numpy, pandas, sklearn; print('Python packages OK')"

# Utwórz dedykowanego użytkownika
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Kopiuj zbudowaną aplikację Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Kopiuj modele i skrypty ML
COPY --chown=nextjs:nodejs models ./models
COPY --chown=nextjs:nodejs scripts ./scripts

# Ustaw uprawnienia dla skryptów Python
RUN chmod +x scripts/*.py

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"] 