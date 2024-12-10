import { MESSAGE_TYPE } from '@repo/common/header';
import { SERVER_HOST } from './constants/env.js';
import BombServer from './classes/models/bomb.server.class.js';

const SERVER_NAME = 'bomb';
const SERVER_PORT = 7019;

const bombMessages = Object.values(MESSAGE_TYPE).filter((value) => value >= 501 && value <= 520);

const server = new BombServer(SERVER_NAME, SERVER_HOST, SERVER_PORT, bombMessages);

await server.start();

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
