FROM node:lts-alpine

WORKDIR /client

COPY package.json ./
COPY package-lock.json ./

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
