import { SERVER_HOST } from './config/env.js';
import DanceServer from './classes/models/dance.server.js';
import { MESSAGE_TYPE } from './utils/constants.js';
import { logger } from './utils/logger.utils.js';

const SERVER_NAME = 'dance';
const SERVER_PORT = 7018;
const server = new DanceServer(SERVER_NAME, SERVER_HOST, SERVER_PORT, Object.values(MESSAGE_TYPE));

await server.start();
server.connectToDistributor(SERVER_HOST, 7010, (data) => {
  // Distributor 연결
  logger.info('Distributor Notification', data);
});
