FROM node:18-alpine
WORKDIR /app
ADD package*.json ./
RUN npm install
RUN apk update
RUN apk add ffmpeg
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]