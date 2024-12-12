import { RedisClient, RedisUtil } from '@repo/common/classes';
import { dartConfig } from '../../config/dart.config.js';

export const subRedisClient = new RedisClient(dartConfig.REDIS.REDIS_INFO).getClient();

export const redisClient = new RedisClient(dartConfig.REDIS.REDIS_INFO).getClient();

export const redisUtil = new RedisUtil(redisClient);
