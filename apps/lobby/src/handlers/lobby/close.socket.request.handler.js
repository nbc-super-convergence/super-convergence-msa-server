import lobbyManager from '../../classes/manager/lobby.manager.js';
import { logger } from '../../utils/logger.utils.js';

export const closeSocketRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;

  try {
    await lobbyManager.leaveUser(sessionId);
  } catch (error) {
    logger.error('[ closeSocketRequestHandler ] ====>  error', { sessionId, error });
  }
};
