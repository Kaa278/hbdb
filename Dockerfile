# Use official Node.js Alpine (Pure JS version)
FROM node:20-alpine

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies (bcryptjs doesn't need build tools!)
RUN npm install

# Copy project files
COPY . .

# Run build using the EXPLICIT local bin path
RUN ./node_modules/.bin/next build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
