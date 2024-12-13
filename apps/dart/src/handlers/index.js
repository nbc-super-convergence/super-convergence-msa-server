import { MESSAGE_TYPE } from '@repo/common/header';
import {
  dartCloseSocketRequestHandler,
  dartGameReadyRequestHandler,
  dartGameThrowRequestHandler,
  dartPannelSyncRequestHandler,
  dartSyncRequestHandler,
} from './dart.handlers.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.DART_GAME_READY_REQUSET]: { handler: dartGameReadyRequestHandler },
  [MESSAGE_TYPE.DART_GAME_THROW_REQUEST]: { handler: dartGameThrowRequestHandler },
  [MESSAGE_TYPE.DART_PANNEL_SYNC_REQUEST]: { handler: dartPannelSyncRequestHandler },
  [MESSAGE_TYPE.DART_SYNC_REQUEST]: { handler: dartSyncRequestHandler },
  [MESSAGE_TYPE.CLOSE_SOCKET_REQUEST]: { handler: dartCloseSocketRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
