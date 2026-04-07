# Use official Node.js Alpine (Pure JS version)
FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies (bcryptjs doesn't need build tools!)
RUN npm install

# Copy project files
COPY . .

# Run build using the standard npm script
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
