import RoomServer from './classes/models/room.server.js';

const SERVER_NAME = 'room';
const SERVER_PORT = 7000;
const server = new RoomServer(SERVER_NAME, SERVER_PORT);

await server.start();
server.connectToDistributor('127.0.0.1', 7778, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
