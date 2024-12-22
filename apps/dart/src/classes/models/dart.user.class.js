import { User } from '@repo/common/classes';

class DartUser extends User {
  constructor(gameId, sessionId) {
    super(gameId, sessionId);

    this.rank;
    this.isReady = false;
  }

  getGameId() {
    return this.gameId;
  }

  getSessionId() {
    return this.sessionId;
  }

  gameReady() {
    // * 준비
    this.isReady = true;
  }
}

export default DartUser;
