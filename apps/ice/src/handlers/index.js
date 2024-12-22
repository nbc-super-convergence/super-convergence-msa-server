import { MESSAGE_TYPE } from '@repo/common/header';
import {
  iceCloseSocketRequestHandler,
  iceGameReadyRequestHandler,
  icePlayerDamageRequestHandler,
  icePlayerSyncRequestHandler,
} from './ice.handlers.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.ICE_GAME_READY_REQUEST]: { handler: iceGameReadyRequestHandler },
  [MESSAGE_TYPE.ICE_PLAYER_SYNC_REQUEST]: { handler: icePlayerSyncRequestHandler },
  [MESSAGE_TYPE.ICE_PLAYER_DAMAGE_REQUEST]: { handler: icePlayerDamageRequestHandler },
  [MESSAGE_TYPE.CLOSE_SOCKET_REQUEST]: { handler: iceCloseSocketRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
