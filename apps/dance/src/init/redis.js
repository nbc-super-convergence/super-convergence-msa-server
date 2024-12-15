import { RedisClient, RedisUtil } from '@repo/common/classes';
import { danceConfig } from '../config/config.js';

//* redis cluster 클라이언트
const redisClient = new RedisClient(danceConfig.REDIS).getClient();
export const redis = new RedisUtil(redisClient);

//* redis pub/sub용 클라이언트
export const pubRedisClient = RedisClient.createPubSubClient(danceConfig.REDIS);

export const subRedisClient = RedisClient.createPubSubClient(danceConfig.REDIS);
