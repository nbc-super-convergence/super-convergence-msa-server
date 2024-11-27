import { RedisClient } from '@repo/common/classes';
import BoardServer from './classes/models/board.server.class.js';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './constants/env.js';

const SERVER_NAME = 'board';
const SERVER_PORT = 7015;
const messageTypes = [];

// Game start (51-60)
const gameStartTypes = Array.from({ length: 10 }, (_, i) => i + 51);

// Game Play (61-90)
const gamePlayTypes = Array.from({ length: 30 }, (_, i) => i + 61);

// Post Game (91-100)
const postGameTypes = Array.from({ length: 10 }, (_, i) => i + 91);

const server = new BoardServer(
  SERVER_NAME,
  SERVER_PORT,
  messageTypes.concat(gameStartTypes, gamePlayTypes, postGameTypes),
);

await server.start();

server.connectToDistributor('127.0.0.1', 7010, (data) => {
  // Distributor 연결
  console.log(' [ Board Server ] Distributor Notification', data);
});
