import AuthServer from './classes/models/auth.server.class.js';
import { config } from './config/config.js';
import { SERVER_HOST } from './constants/env.js';

const TYPE_LENGTH = config.MAX_AUTH_MESSAGE_TYPE;
const TYPES = Array.from({ length: TYPE_LENGTH }, (_, i) => i + 1);

console.log(TYPES);
const SERVER_NAME = config.SERVER_NAME;
const SERVER_PORT = config.SERVER_PORT;
const server = new AuthServer(SERVER_NAME, SERVER_PORT, TYPES);

await server.start();

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
