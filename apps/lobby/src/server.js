import { SERVER_HOST, DISTRIBUTOR_HOST } from './config/env.js';
import LobbyServer from './classes/models/lobby.server.js';
import { MESSAGE_TYPE } from './utils/constants.js';
import { logger } from './utils/logger.utils.js';

const SERVER_NAME = 'lobby';
const SERVER_PORT = 7013;
const server = new LobbyServer(SERVER_NAME, SERVER_HOST, SERVER_PORT, Object.values(MESSAGE_TYPE));

await server.start();
server.connectToDistributor(DISTRIBUTOR_HOST, 7010, (data) => {
  // Distributor 연결
  logger.info('Distributor Notification', data);
});
