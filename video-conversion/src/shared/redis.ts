import { Redis } from 'ioredis';

// const redisConfig = {
//     username: config.redis.username,
//     password: config.redis.password,
//     host: config.redis.host,
//     port: parseInt(config.redis.port),
//     maxRetriesPerRequest: null,
//   };

const redisConfig = {
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisConfig);
const redisPubClient = new Redis(redisConfig);
const redisSubClient = new Redis(redisConfig);

const connect = async () => {
  await redisPubClient.connect();
  await redisSubClient.connect();
};

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
  connect,
  set,
  get,
  del,
  disconnect,
  redisConnection,
  publish: redisPubClient.publish.bind(redisPubClient),
  subscribe: redisSubClient.subscribe.bind(redisSubClient),
};
