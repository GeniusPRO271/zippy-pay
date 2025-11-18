# Build stage
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.* ./

EXPOSE 3000
CMD ["npm", "start"]
