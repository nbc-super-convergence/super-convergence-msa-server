import { MESSAGE_TYPE } from '@repo/common/header';
import IceServer from './classes/models/ice.server.class.js';
import { SERVER_HOST, DISTRIBUTOR_HOST } from './constants/env.js';

const SERVER_NAME = 'ice';
const SERVER_PORT = 7016;

const iceMessages = Object.values(MESSAGE_TYPE).filter((value) => value >= 201 && value <= 211);

const server = new IceServer(SERVER_NAME, SERVER_HOST, SERVER_PORT, iceMessages);

await server.start();

server.connectToDistributor(DISTRIBUTOR_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
