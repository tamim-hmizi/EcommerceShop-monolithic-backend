# Use an official Node.js image as a base (optimized for security & performance)
FROM node:20-alpine AS base

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

# Expose the application port
EXPOSE 5000

# Use a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the application
CMD ["node", "index.js"]
