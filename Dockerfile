# Use official Node.js Alpine (lighter & faster for STBs)
FROM node:20-alpine

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Run build using the EXPLICIT local bin path to avoid "not found"
RUN ./node_modules/.bin/next build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
