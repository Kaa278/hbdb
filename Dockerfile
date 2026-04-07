# Use official Node.js Alpine
FROM node:20-alpine

# Install build essentials if needed (though bcryptjs is pure JS, some deps might need it)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Clean install all dependencies
RUN npm install

# Copy project files
COPY . .

# Ensure next is executable and run build
RUN npx next build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
