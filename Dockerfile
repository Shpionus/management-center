FROM node:14.9.0-alpine
LABEL maintainer="philip.ackermann@cedalo.com"

RUN apk --no-cache add g++ make bash curl nginx git gnupg python rsync unzip

WORKDIR /mosquitto-ui

COPY frontend/build frontend/build
COPY frontend/start.js frontend/start.js
COPY backend backend

COPY config config
COPY mosquitto-ui.sh mosquitto-ui.sh
COPY package.json package.json
COPY yarn.lock yarn.lock

VOLUME backend/config

RUN yarn install

EXPOSE 8088
EXPOSE 9000

CMD [ "sh", "mosquitto-ui.sh" ]