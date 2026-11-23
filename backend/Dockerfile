# syntax=docker/dockerfile:1
# ==============================================================================
# Multi-Stage Dockerfile - Project Manager Express API
# ==============================================================================

# --- Stage 1: Production dependencies ---
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Stage 2: Minimal non-root runtime ---
FROM node:22-alpine AS runtime

LABEL org.opencontainers.image.title="Project Manager API" \
      org.opencontainers.image.description="Express + JWT + PostgreSQL backend for Project Manager" \
      org.opencontainers.image.source="https://github.com/Sochoaq/project-manager"

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "src/index.js"]
