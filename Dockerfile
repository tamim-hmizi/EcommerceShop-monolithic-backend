FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
# npm, npx, corepack and yarn are only needed to install; the runtime is plain node.
RUN npm ci --omit=dev && \
    npm cache clean --force && \
    rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
           /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*

COPY . .

# Uploaded product/category images are written here (mount a volume to persist)
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

EXPOSE 5000
USER node
CMD ["node", "index.js"]
