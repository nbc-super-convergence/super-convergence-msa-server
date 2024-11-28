import { STATE } from '../../constants/enums.js';
import Vector from './vector.class.js';

class Player {
  constructor(id, position, rotation) {
    this.id = id;

    this.hp = 10;
    this.position = new Vector(position);
    this.state = STATE.IDLE;
    this.rotation = rotation; // * - 포함
    this.rank;
    this.isReady = false;
  }

  updateState(position, rotation, state) {}

  damage() {}

  playerDead() {}

  resetPlayer() {}
}

export default Player;
