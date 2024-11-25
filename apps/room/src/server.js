import RoomServer from './classes/models/room.server.js';
import { MESSAGE_TYPE } from './utils/constants.js';

const SERVER_NAME = 'room';
const SERVER_PORT = 7014;
const server = new RoomServer(SERVER_NAME, SERVER_PORT, Object.values(MESSAGE_TYPE));

await server.start();
server.connectToDistributor('127.0.0.1', 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
