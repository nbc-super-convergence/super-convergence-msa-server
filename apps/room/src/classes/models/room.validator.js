import { redis } from '../../init/redis.js';
import { logger } from '../../utils/logger.utils.js';

class RoomValidator {
  /**
   * 유저와 관련된 모든 데이터를 한 번에 조회
   * @param {string} sessionId
   * @returns {Object} 유저의 정보들
   */
  static async getUserData(sessionId) {
    try {
      const [nickname, location] = await Promise.all([
        redis.getUserToSession(sessionId),
        redis.getUserLocation(sessionId),
      ]);

      return {
        nickname: nickname || null,
        location: location || {},
      };
    } catch (error) {
      logger.error('[ getUserData ] ====> error', error);
      return {
        nickname: null,
        location: {},
      };
    }
  }

  /**
   * 대기방 관련 데이터를 한 번에 조회
   * @param {string} roomId
   * @returns {Object} 유저의 대기방 정보
   */
  static async getRoomData(roomId) {
    try {
      const roomData = await redis.getRoom(roomId);
      return roomData || null;
    } catch (error) {
      logger.error('[ getRoomData ] ====> error', error);
      return null;
    }
  }

  /**
   * 유저와 대기방 데이터를 모두 한 번에 검증
   * @param {string} sessionId
   * @returns {Object} 유저의 정보들
   */
  static async validateAll(sessionId) {
    try {
      // 클러스터 환경에서는 Promise.all 사용
      const [nickname, location] = await Promise.all([
        redis.getUserToSession(sessionId),
        redis.getUserLocation(sessionId),
      ]);

      let roomData = null;
      if (location && location.room) {
        roomData = await redis.getRoom(location.room);
      }

      return {
        nickname: nickname || null,
        location: location || {},
        roomData,
      };
    } catch (error) {
      logger.error('[ validateAll ] ====> error', error);
      return {
        nickname: null,
        location: {},
        roomData: null,
      };
    }
  }
}

export default RoomValidator;
