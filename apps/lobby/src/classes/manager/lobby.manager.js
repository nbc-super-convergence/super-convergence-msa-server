import Lobby from '../models/lobby.class.js';

class LobbyManager {
  constructor() {
    if (LobbyManager.instance) {
      return LobbyManager.instance;
    }

    this.lobby = new Lobby();
    LobbyManager.instance = this;
  }

  static getInstance() {
    if (!LobbyManager.instance) {
      LobbyManager.instance = new LobbyManager();
    }
    return LobbyManager.instance;
  }

  /**
   * 유저 로비 입장
   * @param {UserData} userData - 입장할 유저의 데이터
   * @returns {LobbyResponse}
   */
  joinUser(userData) {
    return this.lobby.joinUser(userData);
  }

  /**
   * 유저 로비 퇴장
   * @param {string} userId - 퇴장할 유저 ID
   * @returns {LobbyResponse}
   */
  leaveUser(userId) {
    return this.lobby.leaveUser(userId);
  }

  /**
   * 유저 상세 정보 조회
   * @param {string} targetUserId - 조회할 유저 ID
   * @returns {LobbyResponse}
   */
  getUserDetail(targetUserId) {
    return this.lobby.getUserDetail(targetUserId);
  }

  /**
   * 현재 로비에 접속 중인 유저 목록
   * @returns {UserData[]} - 접속 중인 유저들의 정보들
   */
  getUserList() {
    return this.lobby.getUserList();
  }
}

const lobbyManagerInstance = LobbyManager.getInstance();
Object.freeze(lobbyManagerInstance);

export default lobbyManagerInstance;
