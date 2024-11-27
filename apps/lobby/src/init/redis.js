import { RedisClient, RedisUtil } from '@repo/common/classes';
import { config } from '../../config/config.js';

const redisClient = new RedisClient({
  host: config.REDIS.HOST,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD,
}).getClient();

export const redis = new RedisUtil(redisClient);
