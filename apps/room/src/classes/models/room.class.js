/**
 * @typedef {Object} UserData
 * @property {string} userId - 유저 ID
 * @property {string} nickname - 유저 닉네임
 */

/**
 * @typedef {Object} RoomResponse
 * @property {boolean} success - 성공 여부
 * @property {Object} data - 성공 시 반환할 데이터
 * @property {number} failCode - 실패 코드 (0: 성공)
 */

class Room {
  /**
   * @param {string} id - 대기방 ID
   * @param {string} ownerId - 방장 ID
   * @param {string} name - 대기방 이름
   */
  constructor(id, ownerId, name) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    /** @type {'wait'|'prepare'|'board'|'mini'} */
    this.state = 'wait';
    /** @type {Map<string, UserData>} userId -> userData */
    this.users = new Map();
    this.maxUsers = 4; // TODO: 생성 때 변경가능해지면 수정 / option.maxUsers
    /** @type {Set<string>} userId */
    this.readyUsers = new Set();
    // TODO: 생성 때 변경가능해지면 수정 / this.password = option.password
  }

  /**
   * 유저의 대기방 참가
   * @param {UserData} userData - 참가할 유저의 데이터
   * @returns {RoomResponse} 참가 결과
   */
  joinUser(userData) {
    if (this.users.size >= this.maxUsers) {
      return { success: false, data: {}, failCode: 1 };
    }

    if (this.users.has(userData.userId)) {
      return { success: false, data: {}, failCode: 1 };
    }

    this.users.set(userData.userId, userData);

    return { success: true, data: this.getRoomData(), failCode: 0 };
  }

  /**
   * 유저의 대기방 퇴장
   * @param {string} userId - 퇴장할 유저의 ID
   * @returns {RoomResponse} 퇴장 결과
   */
  leaveUser(userId) {
    if (!this.users.has(userId)) {
      return { success: false, data: {}, failCode: 1 };
    }

    this.users.delete(userId);
    this.readyUsers.delete(userId);

    return { success: true, data: {}, failCode: 0 };
  }

  /**
   * 유저의 준비 상태 설정
   * @param {string} userId - 준비/취소할 유저의 ID
   * @param {boolean} isReady - true: 준비, false: 준비 취소
   * @returns {RoomResponse} 준비 결과
   */
  updateReady(userId, isReady) {
    if (!this.users.has(userId)) {
      return { success: false, data: { isReady: false }, failCode: 1 };
    }

    if (isReady) {
      this.readyUsers.add(userId);
    } else {
      this.readyUsers.delete(userId);
    }

    return { success: true, data: { isReady: this.readyUsers.has(userId) }, failCode: 0 };
  }

  /**
   * 대기방 정보 조회
   * @returns {{
   *   id: string,
   *   ownerId: string,
   *   name: string,
   *   state: string,
   *   users: UserData[],
   *   maxUsers: number,
   *   readyUsers: string[]
   * }}
   */
  getRoomData() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      state: this.state,
      users: Array.from(this.users.values()),
      maxUsers: this.maxUsers,
      readyUsers: Array.from(this.readyUsers),
    };
  }

  /**
   * 모든 유저가 준비했는지 확인
   * @returns {boolean} 모든 유저가 준비되었는지 여부
   */
  isAllReady() {
    if (this.readyUsers.size === this.users.size) {
      this.state = 'prepare';
      return true;
    }

    return false;
  }

  // TODO: 수동 변경시 패킷 추가가 필요해보임
  /**
   * 방장 변경
   * @param {string} newOwnerId - 새로운 방장 ID
   * @returns {RoomResponse} 방장 변경 결과
   */
  changeOwner(newOwnerId) {
    if (!this.users.has(newOwnerId)) {
      return { success: false, data: {}, failCode: 1 };
    }

    this.ownerId = newOwnerId;

    return { success: true, data: {}, failCode: 0 };
  }

  /**
   * 대기방 상태 변경
   * @param {'wait'|'prepare'|'board'|'mini'} state - 변경할 상태
   */
  updateState(state) {
    this.state = state;
  }

  // TODO: 패킷 추가가 필요해보임
  /**
   * 대기방 설정 변경
   * @param {{name: string}} info - 변경할 방 정보
   */
  updateInfo(info) {
    this.name = info.name;
    // TODO: maxUsers, password 등도 추가 가능성 있음
  }

  /**
   * 유저가 없는지 확인
   * @returns {boolean} 방이 비어있는지 여부
   */
  isEmpty() {
    return this.users.size === 0;
  }
}

export default Room;
