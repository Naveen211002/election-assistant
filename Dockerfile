FROM node:20-slim

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Security: run as non-root user (GCP best practice)
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Expose port 8080 (Cloud Run mandatory port)
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://localhost:8080/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the server
CMD ["node", "server.js"]
