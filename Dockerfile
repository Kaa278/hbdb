# Stage 1: Build
FROM node:20-alpine AS builder

# Install build tools for native modules (bcryptjs is pure JS, but others might need it)
# We use --no-cache to keep the builder layer clean
RUN apk add --no-cache python3 make g++ bash

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
