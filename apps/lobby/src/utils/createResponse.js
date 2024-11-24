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
    case MESSAGE_TYPE.LOBBY_USER_LIST_RESPONSE:
      response = {
        ...response,
        userList: result.data.userList,
      };
      break;

    case MESSAGE_TYPE.LOBBY_USER_DETAIL_RESPONSE:
      response = {
        ...response,
        userDetail: result.data.userDetail,
      };
      break;

    default:
      break;
  }

  return serialize(messageType, response, 0, getPayloadNameByMessageType);
};
