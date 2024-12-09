import { RedisClient, RedisUtil } from '@repo/common/classes';
import { danceConfig } from '../config/config.js';

export const subRedisClient = new RedisClient(danceConfig.REDIS.REDIS_INFO).getClient();

const redisClient = new RedisClient(danceConfig.REDIS.REDIS_INFO).getClient();

export const redis = new RedisUtil(redisClient);
