import { RedisClient, RedisUtil } from '@repo/common/classes';
import { bombConfig } from '../config/config.js';

export const redisClient = new RedisClient(bombConfig.REDIS.REDIS_INFO).getClient();
export const subRedisClient = new RedisClient(bombConfig.REDIS.REDIS_INFO).getClient();

export const redisUtil = new RedisUtil(redisClient);
