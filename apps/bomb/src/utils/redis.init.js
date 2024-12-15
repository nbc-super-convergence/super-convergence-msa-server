import { RedisClient, RedisUtil } from '@repo/common/classes';
import { bombConfig } from '../config/config.js';

//* redis cluster 클라이언트
const redisClient = new RedisClient(bombConfig.REDIS).getClient();
export const redisUtil = new RedisUtil(redisClient);

//* redis pub/sub용 클라이언트
export const pubRedisClient = RedisClient.createPubSubClient(bombConfig.REDIS);

export const subRedisClient = RedisClient.createPubSubClient(bombConfig.REDIS);
