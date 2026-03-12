FROM oven/bun:1
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG SESSION_SECRET

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV SESSION_SECRET=${SESSION_SECRET}

COPY package.json bun.lock* ./

RUN bun install

COPY . .

# Build Next.js WITH env variable
RUN bun run build

# Optional: prune devDependencies
RUN bun install --production

EXPOSE 3000
CMD ["bun", "start"]
