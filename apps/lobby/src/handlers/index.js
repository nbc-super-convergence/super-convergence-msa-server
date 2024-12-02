import { MESSAGE_TYPE } from '../utils/constants.js';
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
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
