import dotenv from 'dotenv';

dotenv.config();

// REDIS
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORTS = {
  PORT1: process.env.REDIS_PORT1,
  PORT2: process.env.REDIS_PORT2,
  PORT3: process.env.REDIS_PORT3,
  PORT4: process.env.REDIS_PORT4,
  PORT5: process.env.REDIS_PORT5,
  PORT6: process.env.REDIS_PORT6,
  PUB_SUB: process.env.REDIS_PUB_SUB,
};
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const DISTRIBUTOR_HOST = process.env.DISTRIBUTOR_HOST || 'localhost';

// [ TEST ] 미니게임 테스트용
export const SELECT_MINI_GAME = process.env.SELECT_MINI_GAME || 'ALL';
