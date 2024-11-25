import { serialize } from '../../utils/index.js';
import Player from './player.class.js';

class User {
  constructor(socket, id) {
    this.id = id;
    this.socket = socket;
    this.sequence = 0;
    this.lastUpdateTime = Date.now();

    // TODO: 테스트용 게임 세션 ID로 진행
    this.gameId = 'testGameId'; // Game Session ID
    this.player; // Player
  }

  getNextSequence() {
    return ++this.sequence;
  }

  getGameId() {
    return this.gameId;
  }

  setPlayer(playerId, playerType, position, rotation) {
    this.player = new Player(playerId, playerType, position, rotation);
  }

  /**
   * 유저의 클라이언트에 패킷 송신
   * @param {Object} packet
   */
  sendPacket(packet) {
    const { type, payload } = packet;
    const buffer = serialize(type, payload, this.getNextSequence()); // 직렬화
    this.socket.write(buffer);
  }
}

export default User;
