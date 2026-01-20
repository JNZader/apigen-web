# =============================================================================
# APiGen Studio - Multi-stage Dockerfile
# =============================================================================
# Stage 1: Build the application
# Stage 2: Serve with nginx
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Create non-root user for build stage
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
# SECURITY: Files owned by root with read-only permissions
COPY --chmod=444 package.json package-lock.json ./

# Install dependencies as root (needs write to node_modules)
RUN npm ci --silent

# Copy source code
# SECURITY: Files owned by root, read-only for files (444), read+execute for dirs (555)
COPY --chmod=555 src/ ./src/
COPY --chmod=555 public/ ./public/
COPY --chmod=444 index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json postcss.config.cjs ./

# Build the application (as root since we need to write to dist/)
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user && \
    # Create necessary directories with correct permissions
    mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-user:nginx-user /var/cache/nginx /var/log/nginx /var/run && \
    # Allow nginx to bind to port 80
    touch /run/nginx.pid && \
    chown nginx-user:nginx-user /run/nginx.pid

# Copy custom nginx configuration (read-only, owned by root)
COPY --chmod=444 nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage (read-only, owned by root)
COPY --from=builder --chmod=444 /app/dist /usr/share/nginx/html

# Ensure static files are read-only (defense in depth)
RUN find /usr/share/nginx/html -type f -exec chmod 444 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 555 {} \;

# Switch to non-root user
USER nginx-user

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
