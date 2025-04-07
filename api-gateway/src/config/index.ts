import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const config = {
  env: process.env.NODE_ENV || 'production',
  port: process.env.PORT as unknown as number,
  redis: {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  azure: {
    accountName: process.env.AZURE_ACCOUNT_NAME,
    accountKey: process.env.AZURE_ACCOUNT_KEY,
    containerName: process.env.AZURE_CONTAINER_NAME,
    storage_connection_string: process.env.AZURE_STORAGE_CONNECTION_STRING,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  services: {
    api: process.env.API_SERVER_URL,
    video: process.env.VIDEO_SERVER_URL,
    client: process.env.CLIENT_URL,
  },
  doSpaces: {
    endpoint: process.env.DO_SPACES_ENDPOINT,
    accessKey: process.env.DO_SPACES_ACCESS_KEY,
    secretKey: process.env.DO_SPACES_SECRET_KEY,
    bucketName: process.env.DO_SPACES_BUCKET_NAME,
    region: process.env.DO_SPACES_REGION,
  },
};

export default config;
