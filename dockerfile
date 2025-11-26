# Use official Node.js LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package files first (better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose backend port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]