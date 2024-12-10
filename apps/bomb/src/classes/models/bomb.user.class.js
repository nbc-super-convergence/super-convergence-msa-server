import { User, Vector } from '@repo/common/classes';
import { USER_STATE } from '../../constants/user.js';

class BombUser extends User {
  constructor(gameId, sessionId, position, rotation) {
    super(gameId, sessionId);
    this.gameId = gameId;
    this.sessionId = sessionId;

    this.position = new Vector(position);
    this.rotation = rotation;
    this.state = USER_STATE.IDLE;
    this.rank = null;

    this.isReady = false;
    this.startInfos;

    this.saveStartInfo();
  }

  gameReady() {
    this.isReady = true;
  }

  isDead() {
    return this.state === USER_STATE.DIE ? true : false;
  }

  boom() {
    this.state = USER_STATE.DIE;
  }

  updateUserInfos(position, rotation, state) {
    // * sync 업데이트
    if (this.state !== USER_STATE.DIE) {
      this.position.set(position);
      this.rotation = rotation;
      this.state = state;
    }
  }

  ranking(rank) {
    this.rank = rank;
  }

  saveStartInfo() {
    // * 게임 초기 정보
    this.startInfos = {
      position: this.position,
      rotation: this.rotation,
    };
  }

  reset() {
    this.rank = null;
    this.isReady = false;
    this.state = USER_STATE.IDLE;
  }
}

export default BombUser;
