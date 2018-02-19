FROM node:latest

RUN apt-get update && apt-get upgrade -y
RUN npm install nodemon -g && npm install express-generator -g \
  && npm install express -g

EXPOSE 3000
WORKDIR /app
