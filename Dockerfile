FROM node:14

# Install Redis
RUN apt-get update && apt-get install -y redis-server

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "your-app-start-file.js" ]