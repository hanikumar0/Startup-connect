FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# ─── Production Stage ───
FROM node:20-alpine

WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Run as non-root
USER nodejs

# Start the application
CMD ["node", "src/server.js"]
