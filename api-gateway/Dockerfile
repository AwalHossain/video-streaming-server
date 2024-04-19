FROM node:18-alpine AS builder

WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

# production environment
FROM node:18-alpine AS final

WORKDIR /app

COPY --from=builder ./app/dist ./dist
COPY package.json .
COPY yarn.lock .

RUN yarn install --production

CMD ["npm", "start"]