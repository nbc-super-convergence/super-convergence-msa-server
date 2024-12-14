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
    case MESSAGE_TYPE.ROOM_LIST_RESPONSE:
      response = {
        ...response,
        rooms: result.data,
      };
      break;

    case MESSAGE_TYPE.CREATE_ROOM_RESPONSE:
      response = {
        ...response,
        room: result.data,
      };
      break;

    case MESSAGE_TYPE.JOIN_ROOM_RESPONSE:
      response = {
        ...response,
        room: result.data,
      };
      break;

    case MESSAGE_TYPE.GAME_PREPARE_RESPONSE:
      response = {
        ...response,
        isReady: result.data,
      };
      break;

    case MESSAGE_TYPE.ROOM_KICK_RESPONSE:
      response = {
        ...response,
        room: result.data,
      };
      break;

    default:
      break;
  }

  logger.info('[ createResponse ] ====> result', { messageType, ...result });

  return serializeForGate(messageType, response, 0, [sessionId]);
};
