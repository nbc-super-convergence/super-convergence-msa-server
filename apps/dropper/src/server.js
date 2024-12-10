import { MESSAGE_TYPE } from '@repo/common/header';
import DropperServer from './classes/models/dropper.server.class.js';
import { SERVER_HOST } from './constants/env.js';

const SERVER_NAME = 'dropper';
const SERVER_PORT = 7017;

const messageTypes = Object.values(MESSAGE_TYPE).filter((value) => value >= 301 && value <= 310);

const server = new DropperServer(SERVER_NAME, SERVER_HOST, SERVER_PORT, messageTypes);

await server.start();

server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  console.log('Distributor Notification', data);
});
