import { STATE } from '../../constants/enums.js';
import Vector from './vector.class.js';

class Player {
  constructor(id, type, position, rotation) {
    this.id = id;
    this.type = type;

    this.hp = 100;
    this.position = new Vector(position);
    this.vector = new Vector({ x: 0, y: 0, z: 0 });
    this.state = STATE.IDLE;
    this.rotation = rotation; // * - 포함
  }

  updatePosition(position, vector, rotation) {
    this.position.set(position);
    this.vector.set(vector);
    this.rotation = rotation;
  }
}

export default Player;
