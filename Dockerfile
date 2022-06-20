FROM node:alpine3.14

# Create app directory
WORKDIR /usr/src/app/server

# Install app dependencies
COPY ./server/package.json /usr/src/app/server

RUN npm install

WORKDIR /usr/src/app

#Bundle app source
COPY . .

WORKDIR /usr/src/app/server

EXPOSE 8080
CMD [ "node", "index.js"]