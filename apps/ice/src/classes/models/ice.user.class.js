import { serialize } from '@repo/common/utils';
import { Player } from '@repo/common/classes';
import { User } from '@repo/common/classes';

class iceUser extends User {
  constructor(socket, id) {
    super(socket, id);
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

export default iceUser;
