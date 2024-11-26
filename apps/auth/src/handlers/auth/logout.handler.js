import { redis } from '../../redis.js';

/**
 *  로그아웃 핸들러 (임시)
 *  게이트가 로그아웃한 클라이언트(소켓)의 uuid를 알려준다.
 */

export const logoutHandler = async ({ socket, payload }) => {
  try {
    //
    const { sessionId } = payload;

    const findLoginId = await redis.getUserToSessionfield(sessionId, 'loginId');

    if (findLoginId) {
      await redis.deleteUserToLogin(findLoginId);
    }
  } catch (error) {
    console.error(`[ logoutHandler ] error =>>> `, error);
  }
};
