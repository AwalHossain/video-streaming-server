FROM node:18-alpine
WORKDIR /app
ADD package*.json ./
RUN npm install
RUN apk update
RUN apk add ffmpeg
COPY . .
COPY .env .env
# every RUN command creates a new layer in the image & increases the image size
RUN yarn install
RUN yarn build

# production environment

FROM node:18-alpine AS final

WORKDIR /app

# copy the built files from the builder stage
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/.env .

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

CMD ["npm", "start"]