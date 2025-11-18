FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock* ./

# Install ALL dependencies (not just production)
RUN bun install

COPY . .

# Build
RUN bun run build

# Clean up devDependencies after build (optional)
RUN bun install --production

EXPOSE 3000
CMD ["bun", "start"]
