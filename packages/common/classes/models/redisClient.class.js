import Redis from 'ioredis';

class RedisClient {
  constructor(config) {
    if (config.CLUSTER) {
      this.client = new Redis.Cluster(config.NODES, {
        scaleReads: 'slave',
        redisOptions: {
          password: config.PASSWORD,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        },
        clusterRetryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    } else {
      this.client = new Redis({
        host: config.NODES[0].HOST || 'localhost',
        port: config.NODES[0].PORT || 6379,
        password: config.PASSWORD,
      });
    }

    this.client.on('error', (err) => {
      console.error('Redis error: ', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connect');
    });

    if (config.cluster) {
      this.client.on('node:error', (err) => {
        console.error('Redis Cluster Node error:', err);
      });

      this.client.on('reconnecting', () => {
        console.log('Reconnecting to Redis Cluster...');
      });
    }
  }

  //* pub/sub 전용 클라이언트 생성
  static createPubSubClient(config) {
    //* pub/sub용 단일 노드 연결 (클러스터의 첫 번째 노드 사용)
    const pubsubClient = new Redis({
      host: config.NODES[0].HOST || 'localhost',
      port: config.NODES[0].PORT || 6379,
      password: config.PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    pubsubClient.on('error', (err) => {
      console.error('PubSub Redis error:', err);
    });

    pubsubClient.on('connect', () => {
      console.log('PubSub Redis connected');
    });

    return pubsubClient;
  }

  getClient() {
    return this.client;
  }

  async quit() {
    await this.client.quit();
  }
}

export default RedisClient;
