FROM python:3.11-slim

WORKDIR /app

# Instaluj zależności systemowe
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Kopiuj requirements i instaluj zależności Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiuj kod aplikacji
COPY . .

# Utwórz katalog dla modeli
RUN mkdir -p models

# Ustaw zmienne środowiskowe
ENV PYTHONPATH=/app
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Uruchom aplikację
CMD ["python", "main.py"] 