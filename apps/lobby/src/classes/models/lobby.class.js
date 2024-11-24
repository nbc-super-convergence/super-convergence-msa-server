/**
 * @typedef {Object} UserData
 * @property {number} userId
 * @property {string} nickname
 */

/**
 * @typedef {Object} LobbyResponse
 * @property {boolean} success
 * @property {Object} data
 * @property {number} failCode
 */

class Lobby {
  constructor() {
    /** @type {Map<number, UserData>} userId -> userData */
    this.users = new Map();
  }

  /**
   * 유저 로비 입장
   * @param {UserData} userData - 입장할 유저의 데이터
   * @returns {LobbyResponse}
   */
  joinUser(userData) {
    if (this.users.has(userData.userId)) {
      return { success: false, data: {}, failCode: 1 };
    }

    this.users.set(userData.userId, userData);
    return { success: true, data: {}, failCode: 0 };
  }

  /**
   * 유저 로비 퇴장
   * @param {string} userId - 퇴장할 유저 ID
   * @returns {LobbyResponse}
   */
  leaveUser(userId) {
    if (!this.users.has(userId)) {
      return { success: false, data: {}, failCode: 1 };
    }

    this.users.delete(userId);
    return { success: true, data: {}, failCode: 0 };
  }

  /**
   * 유저 상세 정보 조회
   * @param {string} targetUserId - 조회할 유저 ID
   * @returns {LobbyResponse}
   */
  getUserDetail(targetUserId) {
    const user = this.users.get(targetUserId);
    if (!user) {
      return { success: false, data: {}, failCode: 1 };
    }

    // TODO: 레벨이 추가되거나 없어지게되면 수정 필요
    return {
      success: true,
      data: {
        userDetail: {
          userId: user.userId,
          nickname: user.nickname,
          level: '1', // 임시
        },
      },
      failCode: 0,
    };
  }

  /**
   * 현재 로비에 접속 중인 유저 목록
   * @returns {UserData[]} - 접속 중인 유저들의 정보들
   */
  getUserList() {
    return {
      success: true,
      data: { userList: Array.from(this.users.values()) },
      failCode: 0,
    };
  }
}

export default Lobby;
