import dotenv from 'dotenv';

dotenv.config();

const config = {
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
};

export default config;
