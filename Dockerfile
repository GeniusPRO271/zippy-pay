FROM oven/bun:1
WORKDIR /app

# Accept env vars from Railway at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json bun.lock* ./

RUN bun install

COPY . .

# Build Next.js WITH env variable
RUN bun run build

# Optional: prune devDependencies
RUN bun install --production

EXPOSE 3000
CMD ["bun", "start"]
