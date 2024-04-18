FROM node:18-alpine AS builder
# working directory
WORKDIR /app

# copy everything into the container working directory
COPY . .
# every RUN command creates a new layer in the image & increases the image size
RUN yarn install
RUN yarn build

# production environment

FROM node:18-alpine AS final

WORKDIR /app

# install ffmpeg
RUN apk add --no-cache ffmpeg

COPY --from=builder ./app/dist ./dist
COPY package.json .
COPY yarn.lock .

RUN yarn install --production

CMD [ "yarn", "start" ]

