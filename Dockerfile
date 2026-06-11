FROM ghcr.io/cirruslabs/flutter:3.44.0 AS flutter-build

COPY /client /app/
WORKDIR /app/client
RUN flutter build web

FROM node:26-alpine3.23

COPY server/package.json /app/
COPY server/src /app/src/
COPY --from=flutter-build /app/build/web /client/build/web/

WORKDIR /app

RUN npm install

CMD ["node", "src/index.ts"]
