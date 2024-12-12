import { MESSAGE_TYPE } from './constants.js';
import { serializeForGate } from '@repo/common/utils';
import { logger } from './logger.utils.js';

export const createResponse = (result, messageType, sessionId) => {
  let response = {
    success: result.success,
    failCode: result.failCode,
  };

  // 메시지 타입별로 응답 데이터 구조 설정
  switch (messageType) {
    case MESSAGE_TYPE.DANCE_KEY_PRESS_RESPONSE:
      response = {
        ...response,
        correct: result.data,
        state: result.state,
      };
      break;

    default:
      break;
  }

  logger.info('[ createResponse ] ====> result', { messageType, ...result });

  return serializeForGate(messageType, response, 0, [sessionId]);
};
