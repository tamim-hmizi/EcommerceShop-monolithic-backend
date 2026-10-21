FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Uploaded product/category images are written here (mount a volume to persist)
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE 5000
USER node
CMD ["node", "index.js"]
