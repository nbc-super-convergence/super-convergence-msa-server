import { getPayloadNameByMessageType } from '../../handlers/index.js';
import { serialize } from '../../utils/index.js';
import Player from './player.class.js';

class User {
  constructor(id, gameId, sessionId) {
    this.id = id;

    // TODO: 테스트용 게임 세션 ID로 진행
    this.gameId = gameId; // Game Session ID
    this.sessionId = sessionId;
    this.player; // Player
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
    const payloadType = getPayloadNameByMessageType(type);
    const buffer = serialize(type, payload, this.getNextSequence(), payloadType); // 직렬화
    this.socket.write(buffer);
  }
}

export default User;
