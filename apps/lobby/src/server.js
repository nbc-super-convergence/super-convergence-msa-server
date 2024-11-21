import LobbyServer from './classes/models/lobby.server.js';

const SERVER_NAME = 'Lobby';
const SERVER_PORT = 5570;
const server = new LobbyServer(SERVER_NAME, SERVER_PORT);

await server.start();
server.connectToDistributor('127.0.0.1', 7777, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
