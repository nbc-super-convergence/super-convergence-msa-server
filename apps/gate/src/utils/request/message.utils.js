import { MESSAGE_TYPE } from '@repo/common/header';
import { serialize } from '@repo/common/utils';

/**
 * 접속종료에 따른 처리
 * @param {String} sessionId
 */
export const makeCloseSocketRequest = (sessionId) => {
  const messageType = MESSAGE_TYPE.CLOSE_SOCKET_REQUEST;
  const data = { sessionId };
  return serialize(messageType, data, 0, 'closeSocketRequest');
};
