# --- Build Stage ---
FROM node:20-slim AS builder

# Install build dependencies for native modules (bcrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install ALL dependencies (including devDeps for build)
RUN npm install

# Copy project files
COPY . .

# Run build using the local bin path
RUN ./node_modules/.bin/next build

# --- Production Stage ---
FROM node:20-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

# Clean up devDependencies to keep image small
RUN npm prune --production

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
