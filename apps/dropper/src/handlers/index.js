import { MESSAGE_TYPE } from '@repo/common/header';
import {
  dropperGameReadyRequestHandler,
  dropperPlayerSyncRequestHandler,
} from './dropper.handlers.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.DROP_GAME_READY_REQUEST]: { handler: dropperGameReadyRequestHandler },
  [MESSAGE_TYPE.DROP_PLAYER_SYNC_REQUEST]: { handler: dropperPlayerSyncRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
