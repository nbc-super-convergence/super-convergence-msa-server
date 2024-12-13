FROM node:20-alpine 
WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean

EXPOSE 7020
CMD ["node", "apps/dart/src/server.js"]