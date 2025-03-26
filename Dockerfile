FROM node:22.14.0
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm prune --production
EXPOSE 8080
ENV HOST=0.0.0.0
CMD [ "npm", "start" ]