import BoardServer from './classes/models/board.server.class.js';
import { SERVER_HOST } from './constants/env.js';
import { logger } from './utils/logger.utils.js';

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

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  logger.info(' [ BOARD: server ] Distributor Notification', data);
});
