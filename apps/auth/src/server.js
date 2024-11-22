import AuthServer from './classes/models/auth.server.class.js';
import { dbConfig } from './config/db.config.js';

const SERVER_NAME = 'Auth';
const SERVER_PORT = 5560;
const server = new AuthServer(SERVER_NAME, SERVER_PORT, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

await server.start();

console.log(dbConfig.SERVER_NAME);
server.connectToDistributor('127.0.0.1', 9000, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
