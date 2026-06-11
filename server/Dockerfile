FROM node:26-alpine3.23

COPY package.json /app/
COPY src /app/

WORKDIR /app

RUN npm install

CMD ["node", "index.ts"]
