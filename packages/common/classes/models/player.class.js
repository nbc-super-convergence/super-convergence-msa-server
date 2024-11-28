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

    this.startInfos = {
      id: this.id,
      hp: this.hp,
      position: this.position, // Vector 클래스가 toObject() 같은 메서드를 제공한다고 가정
      state: this.state,
      rotation: this.rotation,
      rank: this.rank,
      isReady: this.isReady,
    };
  }

  updateState(position, rotation, state) {
    this.position.set(position);
    this.rotation = rotation;
    this.state = state;
  }

  damage() {
    this.hp -= 1;
  }

  playerDead() {
    this.state = STATE.DIE;
  }

  resetPlayer() {
    this.hp = this.startInfos.hp;
    this.position = this.startInfos.position;
    this.state = this.startInfos.state;
    this.rotation = this.startInfos.rotation;
    this.rank = this.startInfos.rank;
    this.isReady = this.startInfos.isReady;
  }
}

export default Player;
