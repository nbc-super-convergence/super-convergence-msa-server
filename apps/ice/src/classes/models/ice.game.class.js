import { Game } from '@repo/common/classes';
import { iceMap } from '../../map/ice.Map.js';
import iceUserManager from '../managers/ice.user.manager.js';
import { iceGameOverNotification, iceMapSyncNotification } from '../../utils/ice.notifications.js';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { serializeForGate } from '@repo/common/utils';
import { gameState } from '../../constants/gameState.js';

class iceGame extends Game {
  constructor(id) {
    super(id);

    this.map = iceMap;
    this.gameTimer = iceMap.timer;
    this.timers = {};
    this.startPosition = iceMap.startPosition;
  }

  addUser(users, sessionId) {
    users.forEach((user, index) => {
      //TODO: user.loginId? user.nickName??
      const newUser = iceUserManager.addUser(user.loginId, sessionId, user.sessionId);

      const position = this.startPosition[index].pos;
      const rotation = this.startPosition[index].rot;

      newUser.setPlayer(position, rotation);
      this.users.push(newUser);
    });

    console.log(`게임내 유저들`, this.users);
  }

  getAllUser() {
    return this.users;
  }

  getOtherUsers(id) {
    return this.users.filter((user) => user.id !== id);
  }

  getAllSessionIds() {
    return this.users.map((user) => user.sessionId);
  }

  getOtherSessionIds(id) {
    const users = this.users.filter((user) => user.id !== id);

    return users.map((user) => user.sessionId);
  }

  isAllReady() {
    return this.users.filter((user) => user.player.isReady === true).length === this.users.length;
  }

  getAliveUsers() {
    return this.users.filter((user) => user.player.state !== 2);
  }

  isOneAlive() {
    return this.getAliveUsers().length === 1 ? true : false;
  }

  clearAllPlayers() {
    this.users.forEach((user) => user.player.resetPlayer());
  }

  setGameState(state) {
    this.state = state;
  }

  changeMap(socket) {
    for (let key in this.map.updateTime) {
      const mapKey = `map${key}`;

      this.timers[mapKey] = setTimeout(() => {
        console.log(`맵 변경 시작 : ${mapKey}`);
        this.map.sizes.min += 5;
        this.map.sizes.max -= 5;

        const sessionIds = this.getAllSessionIds();

        const message = iceMapSyncNotification();

        const payloadType = getPayloadNameByMessageType(message.type);

        const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

        socket.write(buffer);

        delete this.timers.map1;
      }, this.map.updateTime[key] * 1000);
    }
  }

  iceGameTimer(socket) {
    this.timers.iceGameTimer = setTimeout(() => {
      console.log(`시간 경과로 게임 종료`);
      let aliveUsers = this.getAliveUsers();

      // * 살아있는 체력 순으로 내림차순 정렬 후, rank
      aliveUsers = aliveUsers.sort((a, b) => b.player.hp - a.player.hp);
      aliveUsers.forEach((user, index) => (user.player.rank = index + 1));

      this.handleGameEnd(socket);
    }, this.gameTimer);
  }

  handleGameEnd(socket) {
    console.log(`게임 종료`);
    // 전체 유저 조회
    const users = this.getAllUser();

    const sessionIds = this.getAllSessionIds();

    const message = iceGameOverNotification(users);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    socket.write(buffer);

    this.reset();
    this.clearAllPlayers();
  }

  reset() {
    this.map = iceMap;
    this.setGameState(gameState.WAIT);

    for (const key in this.timers) {
      clearTimeout(this.timers[key]); // 타이머 제거
    }

    // 모든 키 삭제
    this.timers = {};
  }
}

export default iceGame;
