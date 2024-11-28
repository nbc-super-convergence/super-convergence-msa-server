import { User } from '@repo/common/classes';

// TODO: 이렇게 관리하면 자신의 게임뿐만아니라 다른 ice게임에 있는 유저도 조회하게 됨
// ! 이 부분을 game클래스로 통합할 필요성이 생김
class iceUserManager {
  constructor() {
    if (iceUserManager.instance) {
      return iceUserManager.instance;
    }

    this.users = [];
  }

  static getInstance() {
    if (!iceUserManager.instance) {
      iceUserManager.instance = new iceUserManager();
    }
    return iceUserManager.instance;
  }

  addUser(id, gameId, sessionId) {
    const user = new User(id, gameId, sessionId);

    this.users.push(user);
    return user;
  }

  // ! id = loginId
  getUserById(id) {
    return this.users.find((user) => user.id === id);
  }

  getUserByPlayerId(playerId) {
    return this.users.find((user) => user.player.id === playerId);
  }

  isValidUser(user) {
    return this.users.includes(user) ? true : false;
  }
}

const iceUserManagerInstance = iceUserManager.getInstance();
Object.freeze(iceUserManagerInstance);

export default iceUserManagerInstance;
