import LobbyServer from './classes/models/lobby.server.js';
import { MESSAGE_TYPE } from './utils/constants.js';

const SERVER_NAME = 'lobby';
const SERVER_PORT = 7013;
const server = new LobbyServer(SERVER_NAME, SERVER_PORT, Object.values(MESSAGE_TYPE));

await server.start();
server.connectToDistributor('127.0.0.1', 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
