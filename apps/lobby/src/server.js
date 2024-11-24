import LobbyServer from './classes/models/lobby.server.js';
import { MESSAGE_TYPE } from './utils/constants.js';

const SERVER_NAME = 'lobby';
const SERVER_PORT = 7000;
const server = new LobbyServer(SERVER_NAME, SERVER_PORT, [...MESSAGE_TYPE]);

await server.start();
server.connectToDistributor('127.0.0.1', 9000, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
