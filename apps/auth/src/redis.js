import { RedisClient, RedisUtil } from '@repo/common/classes';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './constants/env.js';

// 레디스 클라우드
const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

const redisClient = new RedisClient(redisConfig).getClient();

export const redis = new RedisUtil(redisClient);
