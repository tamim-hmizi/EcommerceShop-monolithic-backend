# Use an official Node.js image as a base (optimized for security & performance)
FROM node:22.14.0-alpine AS base

# Set environment variable to avoid unnecessary npm warnings
ENV NODE_ENV=production

# Create app directory inside the container
WORKDIR /app

# Copy package files separately for efficient caching
COPY package.json package-lock.json ./ 

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Create the 'uploads' directory and set proper permissions
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Expose the application port
EXPOSE 5000

# Set the user to 'node' which already exists in the base image
USER node

# Start the application
CMD ["node", "index.js"]
