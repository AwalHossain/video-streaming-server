FROM node:18-alpine AS builder
# working directory
WORKDIR /app

# copy everything into the container working directory
COPY . .
COPY .env.example .env
# every RUN command creates a new layer in the image & increases the image size
RUN yarn install
RUN yarn build

# production environment

FROM node:18-alpine AS final

WORKDIR /app

# install ffmpeg
RUN apk add --no-cache ffmpeg

COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/.env .
COPY package.json .
COPY yarn.lock .

RUN yarn install --production

CMD [ "yarn", "start" ]
