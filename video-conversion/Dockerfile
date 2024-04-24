FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install
COPY .env.example .env
RUN yarn build
EXPOSE 5000
RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT [ "sh","./entrypoint.sh" ]