FROM node:21.7.1-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

CMD [ "npm", "start" ]