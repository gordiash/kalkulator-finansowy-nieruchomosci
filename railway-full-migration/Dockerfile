# Użyj oficjalnego obrazu Node.js z Python
FROM python:3.11-slim-bookworm

# Zainstaluj Node.js i wymagane biblioteki systemowe
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj package.json i zainstaluj zależności Node.js
COPY package*.json ./
RUN npm ci --only=production

# Skopiuj requirements.txt i zainstaluj zależności Python
COPY requirements-railway.txt ./
RUN pip install --break-system-packages --no-cache-dir -r requirements-railway.txt

# Skopiuj modele i skrypty ML PRZED budowaniem Next.js
COPY models/ ./models/
COPY scripts/ ./scripts/

# Ustaw uprawnienia dla skryptów
RUN chmod +x scripts/*.py

# Skopiuj resztę kodu aplikacji
COPY . .

# Zbuduj aplikację Next.js
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Sprawdź czy pliki zostały skopiowane
RUN echo "=== Sprawdzanie plików ML ===" && \
    ls -la models/ || echo "Brak katalogu models" && \
    ls -la scripts/ || echo "Brak katalogu scripts" && \
    python3 --version && \
    which python3

# Ustaw port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Uruchom aplikację
CMD ["npm", "start"] 