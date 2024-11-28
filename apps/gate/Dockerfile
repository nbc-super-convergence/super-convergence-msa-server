FROM node:20-alpine
WORKDIR /app

COPY turbo.json ./
COPY package.json yarn.lock ./
COPY apps/gate/package.json ./apps/gate/package.json
COPY packages ./packages

RUN yarn

COPY apps/gate/dist ./apps/gate/dist
EXPOSE 7011

CMD ["node", "apps/gate/dist/server.js"]