import { User, Vector } from '@repo/common/classes';
import { USER_STATE } from '../../constants/user.js';
import { logger } from '../../utils/logger.utils.js';

class BombUser extends User {
  constructor(gameId, sessionId, position, rotation) {
    super(gameId, sessionId);
    this.gameId = gameId;
    this.sessionId = sessionId;

    this.initialPos = new Vector(position);
    this.initialRot = rotation;

    this.position = new Vector(position);
    this.rotation = rotation;

    this.state = USER_STATE.IDLE;
    this.rank = null;

    this.isReady = false;
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
    if (this.isReady === true && this.state !== USER_STATE.DIE) {
      this.position.set(position);
      this.rotation = rotation;
      this.state = state;
    }
  }

  ranking(rank) {
    this.rank = rank;
  }

  reset() {
    logger.info(
      `[bombGame - User.class] - reset`,
      `Position =${this.position} InitialPosition = ${this.initialPos}`,
    );

    this.rank = null;
    this.isReady = false;
    this.state = USER_STATE.IDLE;
    this.position.set(this.initialPos);
    this.rotation = this.initialRot;
  }
}

export default BombUser;
