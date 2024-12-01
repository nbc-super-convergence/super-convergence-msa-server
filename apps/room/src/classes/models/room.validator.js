import { redis } from '../../init/redis.js';

class RoomValidator {
  /**
   * 유저 세션 검증
   * @param {string} sessionId
   */
  static async userSession(sessionId) {
    return await redis.getUserToSession(sessionId);
  }

  /**
   * 유저의 위치 검증 (로비)
   * @param {string} sessionId
   */
  static async userLobbyLocation(sessionId) {
    return await redis.getUserLocationField(sessionId, 'lobby');
  }

  /**
   * 유저의 위치와 로비 일치 여부
   * @param {string} sessionId
   * @param {string} targetLobbyId
   */
  static async lobbyMatch(sessionId, targetLobbyId) {
    const lobbyId = await redis.getUserLocationField(sessionId, 'lobby');
    return lobbyId === targetLobbyId;
  }

  /**
   * 대기방 존재 여부
   * @param {string} roomId
   */
  static async roomExists(roomId) {
    return await redis.getRoom(roomId);
  }

  /**
   * 유저의 위치 검증 (대기방)
   * @param {string} sessionId
   */
  static async userRoomLocation(sessionId) {
    return await redis.getUserLocationField(sessionId, 'room');
  }
}

export default RoomValidator;
