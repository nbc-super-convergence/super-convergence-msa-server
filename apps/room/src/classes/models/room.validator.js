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
      const pipeline = redis.client.pipeline();

      //* 유저 세션 데이터
      pipeline.hget(`${redis.prefix.USER}:${sessionId}, 'nickname'`);

      //* 유저 위치 정보
      pipeline.hgetall(`${redis.prefix.LOCATION}:${sessionId}`);

      const [userResult, locationResult] = await pipeline.exec();

      return {
        nickname: userResult[1] || null,
        location: locationResult[1] || {},
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
      const pipeline = redis.client.pipeline();

      //* 대기방 데이터
      pipeline.hgetall(`${redis.prefix.ROOM}:${roomId}`);

      const [roomResult] = await pipeline.exec();

      return roomResult[1] || null;
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
      const pipeline = redis.client.pipeline();

      //* 유저 관련 데이터 조회
      pipeline.hget(`${redis.prefix.USER}:${sessionId}`, 'nickname');
      pipeline.hgetall(`${redis.prefix.LOCATION}:${sessionId}`);

      const [userResult, locationResult] = await pipeline.exec();

      const location = locationResult[1] || {};
      let roomData = null;

      //* location에 room이 있으면 해당 방 정보도 조회
      if (location.room) {
        const roomResult = await redis.client.hgetall(`${redis.prefix.ROOM}:${location.room}`);
        roomData = roomResult;
      }

      return {
        nickname: userResult[1] || null,
        location,
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
