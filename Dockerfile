# Use official Node.js Alpine
FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
# We don't use apk add here because of DNS issues on the STB
RUN npm install

# Copy project files
COPY . .

# Check if next exists and build
RUN ls -la node_modules/.bin/next && npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
