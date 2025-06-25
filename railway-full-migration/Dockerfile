# Lightweight base with Python 3.11 + Node.js
FROM python:3.11-slim-bookworm

# Install system dependencies in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copy and install Python dependencies (minimal ML stack)
COPY requirements-railway.txt ./
RUN pip install --no-cache-dir --user -r requirements-railway.txt \
    && pip cache purge

# Copy package files and install Node.js production dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Copy ONLY essential ML files (not entire directories)
COPY models/ensemble_optimized_0.79pct.pkl ./models/
COPY models/ensemble_optimized_0.79pct_meta.txt ./models/
COPY models/valuation_rf.pkl ./models/
COPY models/valuation_rf.pkl.meta.txt ./models/
COPY scripts/predict_ensemble_compatible.py ./scripts/
COPY scripts/predict_rf.py ./scripts/

# Set Python PATH
ENV PATH="/root/.local/bin:$PATH"
ENV PYTHONPATH="/root/.local/lib/python3.11/site-packages"

# Copy essential application files only
COPY src/ ./src/
COPY middleware.ts next.config.js tailwind.config.ts postcss.config.mjs ./
COPY tsconfig.json components.json ./

# Build Next.js
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Cleanup after build to reduce image size
RUN rm -rf \
    /root/.cache \
    /tmp/* \
    /var/tmp/* \
    requirements-railway.txt \
    && find /root/.local -name "*.pyc" -delete \
    && find /root/.local -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Runtime configuration
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=2 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start command
CMD ["npm", "start"] 