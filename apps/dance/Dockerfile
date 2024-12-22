FROM node:20-alpine 
WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean

EXPOSE 7018
CMD ["node", "apps/dance/src/server.js"]