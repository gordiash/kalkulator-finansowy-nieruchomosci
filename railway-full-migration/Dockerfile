# Use Python 3.11 slim as base
FROM python:3.11-slim-bookworm

# Install all system dependencies in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get purge -y curl gnupg && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

# Install Python and Node.js dependencies together
COPY requirements-railway-minimal.txt package*.json ./
RUN pip install --no-cache-dir --user -r requirements-railway-minimal.txt && \
    npm ci --only=production --no-audit --no-fund && \
    pip cache purge && npm cache clean --force

# Copy essential application files
COPY src/ ./src/
COPY middleware.ts next.config.js tailwind.config.ts postcss.config.mjs ./
COPY tsconfig.json components.json ./

# Copy ML files
COPY models/ensemble_optimized_0.79pct.pkl ./models/
COPY models/ensemble_optimized_0.79pct_meta.txt ./models/
COPY models/valuation_rf.pkl ./models/
COPY models/valuation_rf.pkl.meta.txt ./models/
COPY scripts/predict_ensemble_compatible.py ./scripts/
COPY scripts/predict_rf.py ./scripts/

# Copy debug script
COPY debug-env.js ./

# Set environment
ENV PATH="/root/.local/bin:$PATH" \
    PYTHONPATH="/root/.local/lib/python3.11/site-packages" \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Build and cleanup in one layer
RUN npm run build && \
    rm -rf /root/.cache /tmp/* /var/tmp/* && \
    find /root/.local -name "*.pyc" -delete && \
    find /root/.local -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

EXPOSE 3000

# Lightweight health check
HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=2 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"] 