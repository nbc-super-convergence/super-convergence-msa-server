FROM node:20-alpine 
WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean

EXPOSE 7019
CMD ["node", "apps/bomb/src/server.js"]