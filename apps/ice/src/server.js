import { RedisClient } from '@repo/common/classes';
import IceServer from './classes/models/ice.server.class.js';
import { SERVER_HOST } from './constants/env.js';
import { REDIS } from './constants/env.js';
import { config } from './config/config.js';
import iceGameManager from './classes/managers/ice.game.manager.js';

const SERVER_NAME = 'ice';
const SERVER_PORT = 7016;

const server = new IceServer(
  SERVER_NAME,
  SERVER_PORT,
  [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212],
);

const subScriber = new RedisClient(REDIS).getClient();

subScriber.subscribe(config.REDIS.CHANNEL, (err, count) => {
  if (err) {
    console.error('Subscribe error:', err);
    return;
  }
  console.log(`Subscribed to ${count} channel(s).`);
});

subScriber.on('message', (channel, message) => {
  console.log(`Received ${config.REDIS.CHANNEL} ===> ${channel}: ${message}`);

  // ! message = boardId
  // TODO: 변경사항에 맞춰서 바꾸기
  const sessionId = subScriber.getBoardGameBySessionId(message);

  iceGameManager.addGame(sessionId);
});

await server.start();

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
