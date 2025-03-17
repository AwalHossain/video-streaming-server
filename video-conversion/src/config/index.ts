import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT,
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
    blob_url: process.env.AZURE_BLOB_URL,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  doSpaces: {
    endpoint: process.env.DO_SPACES_ENDPOINT,
    accessKey: process.env.DO_SPACES_ACCESS_KEY,
    secretKey: process.env.DO_SPACES_SECRET_KEY,
    bucketName: process.env.DO_SPACES_BUCKET_NAME,
    region: process.env.DO_SPACES_REGION,
  }
};

export default config;
