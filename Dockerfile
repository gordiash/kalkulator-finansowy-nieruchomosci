# Użyj oficjalnego obrazu Node.js z Python
FROM node:18-slim

# Zainstaluj Python i wymagane biblioteki systemowe
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    zlib1g-dev \
    libbz2-dev \
    liblzma-dev \
    libffi-dev \
    libssl-dev \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj pliki package.json i zainstaluj zależności Node.js
COPY package*.json ./
RUN npm install

# Skopiuj requirements.txt i zainstaluj zależności Python
COPY requirements-railway.txt ./
RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements-railway.txt

# Skopiuj resztę kodu
COPY . .

# Ustaw specjalne dummy zmienne TYLKO dla build-time
# Railway nadpisze je w runtime (ENV nie blokuje external env vars jeśli użyjemy specjalnego schematu)
ENV NEXT_PUBLIC_SUPABASE_URL="BUILD_TIME_DUMMY_https://example.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="BUILD_TIME_DUMMY_key123"
ENV NEXT_PUBLIC_SITE_URL="https://example.com"

# Zbuduj aplikację Next.js
RUN npm run build

# Wyczyść dummy zmienne przed uruchomieniem (Railway dostarczy prawdziwe)
ENV NEXT_PUBLIC_SUPABASE_URL=""
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Ustaw zmienne środowiskowe dla Python venv
ENV PATH="/app/venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/venv"

# Ustaw port
EXPOSE 3000

# Uruchom aplikację z aktywowanym venv
CMD ["npm", "start"] 