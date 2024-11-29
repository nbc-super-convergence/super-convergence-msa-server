import IceServer from './classes/models/ice.server.class.js';
import { SERVER_HOST } from './constants/env.js';

const SERVER_NAME = 'ice';
const SERVER_PORT = 7016;

const server = new IceServer(
  SERVER_NAME,
  SERVER_PORT,
  [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211],
);

await server.start();

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
