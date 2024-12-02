import { MESSAGE_TYPE } from '@repo/common/header';
import { serialize } from '@repo/common/utils';

/**
 * 접속종료에 따른 로그아웃 처리
 * @param {String} sessionId
 */
export const makeLogoutRequest = (sessionId) => {
  const messageType = MESSAGE_TYPE.LOGIN_REQUEST;
  const data = { sessionId };
  return serialize(messageType, data, 0, 'logoutRequest');
};
