import { User } from '@repo/common/classes';
import icePlayer from './ice.player.class.js';

class iceUser extends User {
  constructor(id, gameId, sessionId) {
    this.id = id;
    this.gameId = gameId;
    this.sessionId = sessionId;
    this.player;
  }

  getGameId() {
    return this.gameId;
  }

  getSessionId() {
    return this.sessionId;
  }

  setPlayer(position, rotation) {
    this.player = new icePlayer(position, rotation);
  }
}

export default iceUser;
