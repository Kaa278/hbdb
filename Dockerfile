# Stage 1: Build
FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (Debian/Bullseye handles build tools better on ARM)
RUN npm install

# Copy project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production (Using Debian Bullseye for stability on STB/ARM)
FROM node:20-bullseye AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
