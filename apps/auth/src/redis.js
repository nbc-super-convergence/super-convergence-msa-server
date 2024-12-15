import { RedisClient, RedisUtil } from '@repo/common/classes';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORTS } from './constants/env.js';

// 레디스 클라우드
const redisConfig = {
  CLUSTER: true,
  NODES: [
    //* 마스터 노드
    { host: REDIS_HOST, port: REDIS_PORTS.PORT1 },
    { host: REDIS_HOST, port: REDIS_PORTS.PORT2 },
    { host: REDIS_HOST, port: REDIS_PORTS.PORT3 },
    //* 복제 노드
    { host: REDIS_HOST, port: REDIS_PORTS.PORT4 },
    { host: REDIS_HOST, port: REDIS_PORTS.PORT5 },
    { host: REDIS_HOST, port: REDIS_PORTS.PORT6 },
  ],
  PUB_SUB: { host: REDIS_HOST, port: REDIS_PORTS.PUB_SUB },
  PASSWORD: REDIS_PASSWORD,
};

//* redis cluster 클라이언트
const redisClient = new RedisClient(redisConfig).getClient();
export const redis = new RedisUtil(redisClient);

//* redis pub/sub용 클라이언트
export const pubRedisClient = RedisClient.createPubSubClient(redisConfig);

export const subRedisClient = RedisClient.createPubSubClient(redisConfig);
