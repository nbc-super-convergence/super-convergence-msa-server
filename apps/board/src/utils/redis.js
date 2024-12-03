import { RedisClient, RedisUtil } from '@repo/common/classes';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../constants/env.js';
import { logger } from './logger.utils.js';

const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

const redisClient = new RedisClient(redisConfig).getClient();

export const redis = new RedisUtil(redisClient);

// TODO: [ TEST ] REDIS PUB/SUB TEST --------------------------
export const createRedisSubcriber = (channel) => {
  // 구독용 레디스 클라이언트
  const subscriber = new RedisClient(redisConfig).getClient();
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
