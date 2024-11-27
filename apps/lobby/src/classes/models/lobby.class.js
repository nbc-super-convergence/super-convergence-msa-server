/**
 * @typedef UserData
 * @property {string} loginId
 * @property {string} nickname
 */

class Lobby {
  /**
   * 유저가 로비에 있는지 확인
   * @param {string} lobbyId
   * @param {string} sessionId
   * @returns {Boolean}
   */
  static async isUserInLobby(lobbyId, sessionId) {
    const currentLobbyId = await redis.getUserLocationField(sessionId, 'lobby');
    return currentLobbyId === lobbyId;
  }

  /**
   * 로비 응답에 필요한 유저 데이터 형식으로 변환
   * @param {Object} userData
   * @returns {UserData}
   */
  static formatUserData(userData) {
    return {
      loginId: userData.loginId,
      nickname: userData.nickname,
    };
  }
}

export default Lobby;
