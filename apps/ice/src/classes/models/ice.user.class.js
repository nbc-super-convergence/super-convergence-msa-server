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
    // * 준비
    this.isReady = true;
  }

  updateUserInfos(position, rotation, state) {
    // * sync 업데이트
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
    // * 게임 초기 정보
    this.startInfos = {
      hp: this.hp,
      position: this.position.get(),
      rotation: this.rotation,
    };
  }

  resetInfo() {
    // * 유저 리셋
    this.hp = this.startInfos.hp;
    this.position.set(this.startInfos.position);
    this.state = USER_STATE.IDLE;
    this.rotation = this.startInfos.rotation;
    this.rank = undefined;
    this.isReady = false;
  }

  getPosition() {
    return this.position;
  }
}

export default iceUser;
