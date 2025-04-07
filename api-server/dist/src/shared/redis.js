"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = exports.redisSubClient = exports.redisPubClient = void 0;
const ioredis_1 = require("ioredis");
const config_1 = __importDefault(require("../config"));
const redisConfig = {
    username: config_1.default.redis.username,
    password: config_1.default.redis.password,
    host: config_1.default.redis.host,
    port: parseInt(config_1.default.redis.port),
    maxRetriesPerRequest: null,
};
// const redisConfig = {
//   host: 'localhost',
//   port: 6379,
//   maxRetriesPerRequest: null,
// };
const redisConnection = new ioredis_1.Redis(redisConfig);
exports.redisPubClient = new ioredis_1.Redis(redisConfig);
exports.redisSubClient = new ioredis_1.Redis(redisConfig);
redisConnection.on("error", (error) => console.log("RedisError", error));
redisConnection.on("connect", () => console.log("Redis Connected"));
redisConnection.on("message", (channel, message) => {
    console.log(`Received the following message from ${channel}: ${message}`);
});
const set = async (key, value, ex) => {
    if (ex) {
        await redisConnection.set(key, value, "EX", ex);
    }
    else {
        await redisConnection.set(key, value);
    }
};
const get = async (key) => {
    return await redisConnection.get(key);
};
const del = async (key) => {
    await redisConnection.del(key);
};
const disconnect = async () => {
    await redisConnection.quit();
    await exports.redisPubClient.quit();
    await exports.redisSubClient.quit();
};
exports.RedisClient = {
    set,
    get,
    del,
    disconnect,
    redisConnection,
    publish: exports.redisPubClient.publish.bind(exports.redisPubClient),
};
