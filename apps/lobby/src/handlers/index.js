import { MESSAGE_TYPE } from '../utils/constants.js';
import { logger } from '../utils/logger.utils.js';
import { lobbyJoinRequestHandler } from './lobby/lobby.join.handler.js';
import { lobbyLeaveRequestHandler } from './lobby/lobby.leave.handler.js';
import { lobbyUserDetailRequestHandler } from './lobby/lobby.user.detail.handler.js';
import { lobbyUserListRequestHandler } from './lobby/lobby.user.list.handler.js';

const handlers = {
  // * lobby
  [MESSAGE_TYPE.LOBBY_JOIN_REQUEST]: { handler: lobbyJoinRequestHandler },
  [MESSAGE_TYPE.LOBBY_LEAVE_REQUEST]: { handler: lobbyLeaveRequestHandler },
  [MESSAGE_TYPE.LOBBY_USER_LIST_REQUEST]: { handler: lobbyUserListRequestHandler },
  [MESSAGE_TYPE.LOBBY_USER_DETAIL_REQUEST]: { handler: lobbyUserDetailRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    logger.error(`[ handler not found ] ====> : ${messageType}`);
  }
  return handlers[messageType].handler;
};
