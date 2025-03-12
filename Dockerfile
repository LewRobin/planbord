FROM ubuntu:latest
LABEL authors="robin"

ENTRYPOINT ["top", "-b"]

FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]