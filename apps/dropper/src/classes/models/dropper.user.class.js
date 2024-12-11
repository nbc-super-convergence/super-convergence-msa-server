import { User } from '@repo/common/classes';
import { USER_STATE } from '../../constants/state.js';

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

  updateUserInfos(slot, rotation, state) {
    // * sync 업데이트
    this.slot = slot;
    this.rotation = rotation;
    this.state = state;
  }

  saveStartInfos() {
    // * 게임 초기 정보
    this.startInfos = {
      slot: this.slot,
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
    this.slot = this.startInfos.slot;
    this.state = USER_STATE.IDLE;
    this.rotation = this.startInfos.rotation;
    this.rank = undefined;
    this.isReady = false;
  }

  getSlot() {
    return this.slot;
  }
}

export default dropperUser;
