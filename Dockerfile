# Use official Node.js Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Force a clean install and VALIDATE that next exists
# We add a dummy echo to bust the cache if needed
RUN echo "Building Kathlyn" && npm install && ls -la node_modules/.bin/next

# Copy project files
COPY . .

# Build using npx
RUN npx next build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
