FROM node:20-alpine

WORKDIR /bot

RUN apk add --no-cache docker-cli docker-cli-compose  curl

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src

RUN npm run build

CMD ["npm", "run", "start"]
