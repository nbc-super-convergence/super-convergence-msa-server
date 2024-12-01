/**
 * @typedef UserData
 * @property {string} sessionId
 * @property {string} nickname
 */

class Lobby {
  /**
   * 로비 응답에 필요한 유저 데이터 형식으로 변환
   * @param {Object} userData
   * @param {string} sessionId
   * @returns {UserData}
   */
  static formatUserData(userData, sessionId) {
    return {
      sessionId,
      nickname: userData.nickname,
    };
  }
}

export default Lobby;
