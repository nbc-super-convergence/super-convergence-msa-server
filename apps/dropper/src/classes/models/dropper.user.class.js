import { User } from '@repo/common/classes';
import { USER_STATE } from '../../../../ice/src/constants/states.js';

class dropperUser extends User {
  constructor(gameId, sessionId, position, rotation) {
    super(gameId, sessionId);

    this.position = position;
    this.rotation = rotation;
    this.state = USER_STATE.IDLE;
    this.rank;
    this.isReady = false;

    this.startInfos;
    this.saveStartInfos();
  }
}

export default dropperUser;
