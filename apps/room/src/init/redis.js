import { RedisClient, RedisUtil } from '@repo/common/classes';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../config/env.js';

const redisClient = new RedisClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
}).getClient();

export const redis = new RedisUtil(redisClient);
