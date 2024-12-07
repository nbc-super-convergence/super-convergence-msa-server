import { MESSAGE_TYPE } from '@repo/common/header';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.DROP_GAME_READY_REQUEST]: { handler: undefined },
  [MESSAGE_TYPE.DROP_PLAYER_SYNC_REQUEST]: { handler: undefined },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
