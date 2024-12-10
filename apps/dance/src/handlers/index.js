import { MESSAGE_TYPE } from '../utils/constants.js';
import { logger } from '../utils/logger.utils.js';
import {
  danceCloseSocketRequestHandler,
  danceKeyPressRequestHandler,
  danceReadyRequestHandler,
  danceTableCompleteRequestHandler,
  danceTableCreateRequestHandler,
} from './dance/dance.handler.js';

const handlers = {
  // * dance
  [MESSAGE_TYPE.DANCE_READY_REQUEST]: { handler: danceReadyRequestHandler },
  [MESSAGE_TYPE.DANCE_TABLE_CREATE_REQUEST]: { handler: danceTableCreateRequestHandler },
  [MESSAGE_TYPE.DANCE_KEY_PRESS_REQUEST]: { handler: danceKeyPressRequestHandler },
  [MESSAGE_TYPE.DANCE_TABLE_COMPLETE_REQUEST]: { handler: danceTableCompleteRequestHandler },
  [MESSAGE_TYPE.CLOSE_SOCKET_REQUEST]: { handler: danceCloseSocketRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    logger.error(`[ dance ] 핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
