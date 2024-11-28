import AuthServer from './classes/models/auth.server.class.js';
import { SERVER_HOST } from './constants/env.js';

const SERVER_NAME = 'Auth';
const SERVER_PORT = 7012;
const server = new AuthServer(SERVER_NAME, SERVER_PORT, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

await server.start();

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
