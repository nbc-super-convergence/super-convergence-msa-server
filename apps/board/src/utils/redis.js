import { RedisClient, RedisUtil } from '@repo/common/classes';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORTS } from '../constants/env.js';
import { logger } from './logger.utils.js';

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

const redisClient = new RedisClient(redisConfig).getClient();
export const redis = new RedisUtil(redisClient);

//* redis pub/sub용 클라이언트
export const pubRedisClient = RedisClient.createPubSubClient(redisConfig);

export const subRedisClient = RedisClient.createPubSubClient(redisConfig);

// TODO: [ TEST ] REDIS PUB/SUB TEST --------------------------
export const createRedisSubcriber = (channel) => {
  // 구독용 레디스 클라이언트
  const subscriber = RedisClient.createPubSubClient(redisConfig);
  // 구독
  subscriber.subscribe(channel, (err, count) => {
    if (err) {
      logger.error('Subscribe error:', err);
      return;
    }
    logger.info(`Subscribed to ${count} channel(s).`);
  });

  // 메시지 수신 이벤트
  subscriber.on('message', (channel, message) => {
    logger.info(`Received notification on ${channel}: ${message}`);

    // 알림에 따라 데이터를 가져올 수도 있음
    if (message.includes('key1')) {
      // 새로운 Redis 클라이언트로 데이터를 읽음
    }
  });
};
