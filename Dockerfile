FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV CONFIGS_PATH=/configs

VOLUME [ "/configs" ]

CMD ["node", "./dist/index.js"]