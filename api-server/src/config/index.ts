import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export default {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  redisUrl: process.env.REDIS_URL,
  redisPort: process.env.REDIS_PORT,
  doSpaces: {
    endpoint: process.env.DO_SPACES_ENDPOINT,
    accessKey: process.env.DO_SPACES_ACCESS_KEY,
    secretKey: process.env.DO_SPACES_SECRET_KEY,
    bucketName: process.env.DO_SPACES_BUCKET_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
  sessionSecret: process.env.SESSION_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  clientUrl: process.env.CLIENT_URL,
  jwtSecret: process.env.JWT_SECRET,
  apiGatway: process.env.API_GATEWAY_URL,
};
