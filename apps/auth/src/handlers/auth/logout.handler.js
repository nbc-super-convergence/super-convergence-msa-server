import { redis } from '../../redis.js';

/**
 *  로그아웃 핸들러
 *  => lobby Server 에서 일괄 처리로 현재 사용하지 않음
 */

export const logoutHandler = async ({ socket, payload }) => {
  try {
    //
    const { sessionId } = payload;

    const findNickname = await redis.getUserToSessionfield(sessionId, 'nickname');

    if (findNickname) {
      await redis.transaction.deleteUser(sessionId, findNickname);
    } else {
      console.error('해당 SessionId 의 접속 기록 없음');
    }
  } catch (error) {
    console.error(`[ logoutHandler ] error =>>> `, error.message);
  }
};
