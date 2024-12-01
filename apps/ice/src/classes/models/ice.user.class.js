import { User, Vector } from '@repo/common/classes';
import { USER_STATE } from '../../constants/states.js';

class iceUser extends User {
  constructor(gameId, sessionId, position, rotation) {
    super(gameId, sessionId);
    this.gameId = gameId;
    this.sessionId = sessionId;

    this.hp = 10;
    this.position = new Vector(position);
    this.rotation = rotation;
    this.state = USER_STATE.IDLE;
    this.rank;
    this.isReady = false;

    this.startInfos;

    this.saveStartInfo();
  }

  getGameId() {
    return this.gameId;
  }

  getSessionId() {
    return this.sessionId;
  }

  gameReady() {
    this.isReady = true;
  }

  updateUserInfos(position, rotation, state) {
    this.position.set(position);
    this.rotation = rotation;
    this.state = state;
  }

  damage() {
    this.hp -= 1;
  }

  isDead() {
    return this.hp <= 0 ? true : false;
  }

  Dead() {
    this.state = USER_STATE.DIE;
  }

  saveStartInfo() {
    this.startInfos = {
      hp: this.hp,
      position: this.position,
      rotation: this.rotation,
    };
  }

  resetInfo() {
    this.hp = this.startInfos.hp;
    this.position = this.startInfos.position;
    this.state = USER_STATE.IDLE;
    this.rotation = this.startInfos.state;
    this.rank = undefined;
    this.isReady = false;
  }

  getPosition() {
    return this.position;
  }
}

export default iceUser;
