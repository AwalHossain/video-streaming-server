import { Redis } from 'ioredis';
import config from '../config';
import { errorLogger, logger } from './logger';

const redisConfig = {
    username: config.redis.username,
    password: config.redis.password,
    host: config.redis.host,
    port: parseInt(config.redis.port),
    maxRetriesPerRequest: null,
  };

// const redisConfig = {
//   host: 'localhost',
//   port: 6379,
//   maxRetriesPerRequest: null,
// };

const redisConnection = new Redis(redisConfig);
export const redisPubClient = new Redis(redisConfig);
export const redisSubClient = new Redis(redisConfig);

redisConnection.on('error', (error) => errorLogger.log('RedisError', error));
redisConnection.on('connect', () => logger.info('Redis Connected'));

redisConnection.on('message', (channel, message) => {
  logger.info(`Received the following message from ${channel}: ${message}`);
});

const set = async (key: string, value: string, ex: number): Promise<void> => {
  if (ex) {
    await redisConnection.set(key, value, 'EX', ex);
  } else {
    await redisConnection.set(key, value);
  }
};

const get = async (key: string): Promise<string | null> => {
  return await redisConnection.get(key);
};

const del = async (key: string) => {
  await redisConnection.del(key);
};

const disconnect = async () => {
  await redisConnection.quit();
  await redisPubClient.quit();
  await redisSubClient.quit();
};

export const RedisClient = {
  set,
  get,
  del,
  disconnect,
  redisConnection,
  publish: redisPubClient.publish.bind(redisPubClient),
};
