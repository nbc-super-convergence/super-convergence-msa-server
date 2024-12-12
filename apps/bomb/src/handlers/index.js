import { MESSAGE_TYPE } from '@repo/common/header';
import {
  bombCloseSocketRequestHandler,
  bombGameReadyRequestHandler,
  bombMoveRequestHandler,
  bombPlayerSyncRequestHandler,
} from './bomb.handler.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.BOMB_GAME_READY_REQUEST]: { handler: bombGameReadyRequestHandler },
  [MESSAGE_TYPE.BOMB_PLAYER_SYNC_REQUEST]: { handler: bombPlayerSyncRequestHandler },
  [MESSAGE_TYPE.BOMB_MOVE_REQUEST]: { handler: bombMoveRequestHandler },
  [MESSAGE_TYPE.CLOSE_SOCKET_REQUEST]: { handler: bombCloseSocketRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
