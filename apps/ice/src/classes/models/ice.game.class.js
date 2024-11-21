import { Game } from '@repo/common/classes';

iceMap;

import {
  createIcePlayerSpawnNotification,
  iceMapSyncNotification,
  icePlayersStateSyncNotification,
  iceStartTestGame,
} from '../../notifications/ice.notifications.js';
import { serialize } from '@repo/common/utils';
import { iceMap } from '../../map/ice.Map.js';

class iceGame extends Game {
  constructor(id, type) {
    super(id, type);

    this.startPosition = [
      { pos: { x: -6, y: 1.9, z: 6 }, rot: 135 },
      { pos: { x: 6, y: 1.9, z: 6 }, rot: -135 },
      { pos: { x: -6, y: 1.9, z: -6 }, rot: 45 },
      { pos: { x: 6, y: 1.9, z: -6 }, rot: -45 },
    ];
  }

  /**
   * 게임세션에 유저 추가
   * @param {User} user
   */
  addUser(user) {
    // TODO: 테스트용 코드, 플레이어 추가
    const playerType = this.users.length + 1;
    user.setPlayer(
      Math.max(...this.users.map((user) => user.player.id), 0) + 1,
      playerType,
      this.startPosition[playerType - 1].pos,
      this.startPosition[playerType - 1].rot,
    );

    /**
     * TODO: 게임 세션당 인원 체크 추가
     */
    this.users.push(user);

    /**
     * TODO: 테스트용 코드, 접속하자마자 위치 정보 전달
     */
    const { type, payload } = createIcePlayerSpawnNotification(
      user.player.id,
      user.player.type,
      user.player.position.get(),
      user.player.vector.get(),
      user.player.rotation,
    );

    const playerSpawnPacket = serialize(type, payload, user.getNextSequence()); // 직렬화

    user.socket.write(playerSpawnPacket);
  }

  getUser(userId) {}

  removeUser(userId) {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
  }

  /**
   * 자신 제외 게임 세션 내 유저의 위치 정보 조회
   * @returns { Object }
   * - players (Array)
   * - playerId (number)
   * - position (object) { x, y, z }
   * - vector (object) { x, y, z }
   * - rotation (number)
   * - state (number)
   */
  getUserPosition() {
    return {
      players: this.users.map((user) => ({
        playerId: user.player.id,
        position: user.player.position,
        vector: user.player.vector,
        rotation: user.player.rotation,
        state: user.player.state,
      })),
    };
  }

  /**
   * 게임 세션 내 모든 유저의 상태 정보를 조회
   * @returns { Object }
   * - players (Array)
   * - playerId (number)
   * - hp (number)
   * - position (object) { x, y, z }
   * - state (number)
   */
  getUserState() {
    return {
      players: this.users.map((user) => ({
        playerId: user.player.id,
        position: user.player.position,
        hp: user.player.vertor,
        State: user.player.rotation,
      })),
    };
  }

  /**
   * 게임 세션 내 모든 유저에게 알림 패킷 송신
   * @param {Object} packet
   */
  notifyUsers(packet) {
    this.users.forEach((user) => user.sendPacket(packet));
  }

  /**
   * 게임 세션 내 본인 이외의 유저에게 알림 패킷 송신
   * @param {Object} packet
   * @param {String} userId
   */
  notifyOtherUsers(packet, userId) {
    const users = this.users.filter((user) => user.id !== userId);
    users.forEach((user) => user.sendPacket(packet));
  }

  /**
   * 상태 동기화 인터벌
   * TODO: 게임 시작 때 추가하고 게임 끝나면 인터벌 삭제하면 될 것 같습니다.
   */
  syncState() {
    this.intervalManager.addInterval(
      this.id,
      () => {
        const userState = this.getUserState();
        const packet = icePlayersStateSyncNotification(userState);
        this.notifyUsers(packet);
      },
      100,
      'syncState',
    );
  }

  /**
   * 게임 내에 생존한 모든 유저 조회
   * @returns {Array}
   */
  getAliveUsersCount() {
    const users = this.users.map((user) => {
      return user.player.state !== 2;
    });

    return users.length;
  }

  /**
   * 맵 동기화 함수
   * TODO: 게임 시작시에 넣어주시면 됩니다!!
   */
  updateMapSync() {
    const mapInfo = iceMap;

    setTimeout(() => {
      mapInfo.min += 5;
      mapInfo.max -= 5;

      // 현재 맵 크기 구함
      const scale = Math.abs(mapInfo.min * mapInfo.max);
      const packet = iceMapSyncNotification(scale);

      this.notifyUsers(packet);
      // 패킷 전송 필요
    }, mapInfo.changeTime[0] * 1000);

    setTimeout(() => {
      mapInfo.min += 5;
      mapInfo.max -= 5;

      const scale = Math.abs(mapInfo.min * mapInfo.max);
      const packet = iceMapSyncNotification(scale);

      this.notifyUsers(packet);
      // 패킷 전송 필요
    }, mapInfo.changeTime[1] * 1000);
  }

  /**
   * 테스트 게임 시작
   * 요청한 유저 개별로 게임 시작
   */
  startTestGame(userId) {
    const user = this.users.find((user) => user.id === userId);
    const packet = iceStartTestGame(user.player.id);
    user.sendPacket(packet);
  }
}

export default iceGame;
