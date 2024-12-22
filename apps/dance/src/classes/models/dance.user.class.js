import { User } from '@repo/common/classes';
import { config } from '@repo/common/config';

const { STATE } = config;

class DanceUser extends User {
  constructor(gameId, sessionId, teamNumber) {
    super(gameId, sessionId);
    this.teamNumber = teamNumber;
    this.state = STATE.DANCE_WAIT; //* state enum 값
    this.isReady = false;
  }

  setReady() {
    this.isReady = true;
  }

  setState(state) {
    this.state = state;
  }
}

export default DanceUser;
