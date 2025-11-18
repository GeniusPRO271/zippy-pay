# Use Debian-based Bun (NOT Alpine)
FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies using Bun
RUN bun install --production

# Copy the rest of the app
COPY . .

# Build the Next.js app using Bun
RUN bun run build

# Expose port for Next.js
EXPOSE 3000

# Start Next.js production server with Bun
CMD ["bun", "start"]
