import { RedisClient, RedisUtil } from '@repo/common/classes';
import { iceConfig } from '../../config/config.js';

export const subRedisClient = new RedisClient(iceConfig.REDIS.REDIS_INFO).getClient();

export const redisClient = new RedisClient(iceConfig.REDIS.REDIS_INFO).getClient();

export const redisUtil = new RedisUtil(redisClient);
