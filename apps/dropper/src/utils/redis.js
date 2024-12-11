import { RedisClient, RedisUtil } from '@repo/common/classes';
import { dropConfig } from '../config/config.js';

export const subRedisClient = new RedisClient(dropConfig.REDIS.REDIS_INFO).getClient();

export const redisClient = new RedisClient(dropConfig.REDIS.REDIS_INFO).getClient();

export const redisUtil = new RedisUtil(redisClient);
