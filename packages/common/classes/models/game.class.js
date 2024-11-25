import IntervalManager from '../managers/interval.manager.js';

class Game {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.state = '';

    this.users = [];
    this.intervalManager = new IntervalManager();
  }

  // TODO: 기능 추가

  addUser(user) {}

  getUser(userId) {}

  removeUser(userId) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
  }

  /**
   * 자신 제외 게임 세션 내 유저의 위치 정보 조회
   * @returns { Object }
   * - players (Array)
   * - playerId (number)
   * - position (object) { x, y, z }
   * - vector (object) { x, y, z }
   * - rotation (number)
   * - state (number)
   */
  getUserPosition() {
    return {
      players: this.users.map((user) => ({
        playerId: user.player.id,
        position: user.player.position,
        force: user.player.force,
        rotation: user.player.rotation,
        state: user.player.state,
      })),
    };
  }

  /**
   * 게임 세션 내 모든 유저의 상태 정보를 조회
   * @returns { Object }
   * - players (Array)
   * - playerId (number)
   * - hp (number)
   * - position (object) { x, y, z }
   * - state (number)
   */
  getUserState() {
    return {
      players: this.users.map((user) => ({
        playerId: user.player.id,
        position: user.player.position,
        hp: user.player.vertor,
        State: user.player.rotation,
      })),
    };
  }

  /**
   * 게임 세션 내 모든 유저에게 알림 패킷 송신
   * @param {Object} packet
   */
  notifyUsers(packet) {
    this.users.forEach((user) => user.sendPacket(packet));
  }

  /**
   * 게임 세션 내 본인 이외의 유저에게 알림 패킷 송신
   * @param {Object} packet
   * @param {String} userId
   */
  notifyOtherUsers(packet, userId) {
    const users = this.users.filter((user) => user.id !== userId);
    users.forEach((user) => user.sendPacket(packet));
  }

  /**
   * 게임 내에 생존한 모든 유저 조회
   * @returns {Array}
   */
  getAliveUsersCount() {
    const users = this.users.map((user) => {
      return user.player.state !== 2;
    });

    return users.length;
  }
}

export default Game;
