FROM node:20-alpine 
WORKDIR /app

# Copy only necessary files for build
COPY . .

# Install dependencies with --production=false
RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean

EXPOSE 7012
CMD ["node", "apps/room/src/server.js"]