import { RedisClient, RedisUtil } from '@repo/common/classes';
import { dartConfig } from '../../config/dart.config.js';

//* redis cluster 클라이언트
const redisClient = new RedisClient(dartConfig.REDIS).getClient();
export const redisUtil = new RedisUtil(redisClient);

//* redis pub/sub용 클라이언트
export const pubRedisClient = RedisClient.createPubSubClient(dartConfig.REDIS);

export const subRedisClient = RedisClient.createPubSubClient(dartConfig.REDIS);
