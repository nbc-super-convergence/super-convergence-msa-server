import Redis from 'ioredis';

class RedisClient {
  constructor(config) {
    this.client = new Redis({
      host: config.host || 'localhost',
      port: config.port || 6379,
      password: config.password,
    });

    this.client.on('error', (err) => {
      console.error('Redis error: ', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connect');
    });
  }

  getClient() {
    return this.client;
  }

  async quit() {
    await this.client.quit();
  }
}

export default RedisClient;
