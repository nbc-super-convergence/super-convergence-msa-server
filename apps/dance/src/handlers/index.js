import { MESSAGE_TYPE } from '../utils/constants.js';
import { logger } from '../utils/logger.utils.js';

const handlers = {
  // * dance
  [MESSAGE_TYPE.aa]: { handler: undefined },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    logger.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
