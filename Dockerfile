# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY server.js .
COPY enrichPrompt.js .
COPY src/ ./src/
COPY public/ ./public/

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
