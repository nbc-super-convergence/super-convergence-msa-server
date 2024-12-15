import { RedisClient, RedisUtil } from '@repo/common/classes';
import { iceConfig } from '../../config/config.js';

//* redis cluster 클라이언트
const redisClient = new RedisClient(iceConfig.REDIS).getClient();
export const redisUtil = new RedisUtil(redisClient);

//* redis pub/sub용 클라이언트
export const pubRedisClient = RedisClient.createPubSubClient(iceConfig.REDIS);

export const subRedisClient = RedisClient.createPubSubClient(iceConfig.REDIS);
