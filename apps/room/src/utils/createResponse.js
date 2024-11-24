import { MESSAGE_TYPE } from './constants.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../handlers/index.js';

export const createResponse = (result, messageType) => {
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

    // room 데이터가 필요없는 응답들
    case MESSAGE_TYPE.LEAVE_ROOM_RESPONSE:
    default:
      break;
  }

  console.log('[ room ] ====> createResponse ', response);

  return serialize(messageType, response, 0, getPayloadNameByMessageType);
};
