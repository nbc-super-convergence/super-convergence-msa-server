import { User } from '@repo/common/classes';
import { USER_STATE } from '../../../../ice/src/constants/states.js';

class dropperUser extends User {
  constructor(gameId, sessionId, slot, rotation) {
    super(gameId, sessionId);

    this.slot = slot;
    this.rotation = rotation;
    this.state = USER_STATE.IDLE;
    this.rank;
    this.isReady = false;

    this.startInfos;
    this.saveStartInfos();
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
    this.position = position;
    this.rotation = rotation;
    this.state = state;
  }

  saveStartInfos() {
    // * 게임 초기 정보
    this.startInfos = {
      position: this.position,
      rotation: this.rotation,
    };
  }

  isDead() {
    return this.state === USER_STATE.DIE ? true : false;
  }

  Dead() {
    this.state = USER_STATE.DIE;
  }

  resetInfo() {
    // * 유저 리셋
    this.position = this.startInfos.position;
    this.state = USER_STATE.IDLE;
    this.rotation = this.startInfos.rotation;
    this.rank = undefined;
    this.isReady = false;
  }

  getPosition() {
    return this.position;
  }
}

export default dropperUser;
