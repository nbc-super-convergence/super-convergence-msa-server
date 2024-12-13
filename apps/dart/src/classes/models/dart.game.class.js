import { Game, IntervalManager, TimeoutManager } from '@repo/common/classes';
import DartUser from './dart.user.class.js';

// TODO : ?
export const sessionIds = new Map();

class DartGame extends Game {
  constructor(id) {
    super(id);
  }

  /**
   * 유저 참가
   * @param {*} users
   * @param {*} gameId
   */
  async addUser(users, gameId) {
    //
    for (let key in users) {
      // * sessionId
      const userId = users[key];

      if (!sessionIds.get(userId)) {
        sessionIds.set(userId, gameId);
      }

      const user = new DartUser(gameId, userId);
      this.users.push(user);
    }
  }

  /**
   * 유저 조회
   * @param {String} sessionId
   * @returns
   */
  getUserBySessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  setGameState(state) {
    this.state = state;
  }

  getAllSessionIds() {
    return this.users.map((user) => user.sessionId);
  }

  getUser() {}

  getAllUsers() {
    return this.users;
  }

  updateMapSync() {}
}

export default DartGame;
