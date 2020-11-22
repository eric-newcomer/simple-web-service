FROM node:lts-alpine

WORKDIR /backend

COPY package.json ./
COPY package-lock.json ./

RUN npm install

EXPOSE 8081

CMD ["npm", "server"]
