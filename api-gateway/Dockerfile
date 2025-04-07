FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency files first
COPY package.json yarn.lock ./
RUN yarn install

# Then copy source code
COPY . .
RUN yarn build

# production environment

FROM node:18-alpine AS final

WORKDIR /app

# copy the built files from the builder stage
COPY --from=builder ./app/dist ./dist

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

EXPOSE 8000

CMD ["npm", "start"]