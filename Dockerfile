# Build
FROM node:16.14.0-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Run
FROM node:16.14.0-slim
WORKDIR /app

ENV CONFIGS_PATH=/configs
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist

VOLUME [ "/configs" ]

USER node

CMD ["node", "--enable-source-maps", "./dist/index.js"]