# syntax=docker/dockerfile:1
# ==============================================================================
# Multi-Stage Dockerfile - Project Manager Angular SPA (Unprivileged Nginx)
# ==============================================================================

# --- Stage 1: Angular production build ---
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Unprivileged static web server (UID 101) ---
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="Project Manager Web UI" \
      org.opencontainers.image.description="Angular standalone SPA served on unprivileged Nginx" \
      org.opencontainers.image.source="https://github.com/Sochoaq/project-manager"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-qO-", "http://127.0.0.1:8080/healthz"]
