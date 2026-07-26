# Use a Node.js lightweight image
FROM node:20-slim

# Install OpenSSL for Prisma, and ca-certificates
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma client
RUN pnpm prisma:generate

# Copy the rest of the backend source code
COPY . .

# Build the TypeScript code to JavaScript
RUN pnpm run build

# Expose the port (default 5000)
EXPOSE 5000

# Start the Node server directly (already built above, skip prestart rebuild)
CMD ["node", "dist/server.js"]
