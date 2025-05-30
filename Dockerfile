# Base image
FROM node:22.14.0-alpine AS base
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy dependencies and install only production modules
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy app source
COPY . .

# Ensure uploads directory exists and is writable
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Expose backend API port
EXPOSE 5000

# Run app as 'node' user
USER node

# Start the backend
CMD ["node", "index.js"]
