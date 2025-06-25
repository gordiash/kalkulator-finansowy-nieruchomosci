# Użyj oficjalnego obrazu Node.js z Python
FROM node:18-slim

# Zainstaluj Python i wymagane biblioteki systemowe
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    curl \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj pliki package.json i zainstaluj zależności Node.js
COPY package*.json ./
RUN npm install

# Skopiuj requirements.txt i zainstaluj zależności Python
COPY requirements-railway.txt ./
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir -r requirements-railway.txt

# Skopiuj modele i skrypty ML
COPY models/ ./models/
COPY scripts/ ./scripts/

# Skopiuj resztę kodu
COPY . .

# Użyj ARG dla build-time (można nadpisać przez Railway runtime vars)
ARG NEXT_PUBLIC_SUPABASE_URL="https://build-dummy-project.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.BUILD_TIME_DUMMY"
ENV NEXT_PUBLIC_SITE_URL="https://example.com"

# Ustaw ARG jako ENV tylko dla build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Zbuduj aplikację Next.js
RUN npm run build

# Po build, usuń ENV - Railway ustawi swoje
ENV NEXT_PUBLIC_SUPABASE_URL=""
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Ustaw PATH dla Python venv
ENV PATH="/app/venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/venv"

# Ustaw port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Uruchom aplikację
CMD ["npm", "start"] 