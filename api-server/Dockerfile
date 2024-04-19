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

# copy the built files from the builder stage
COPY --from=builder ./app/dist ./dist

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

CMD ["npm", "start"]