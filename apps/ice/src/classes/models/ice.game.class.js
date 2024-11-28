import { Game, User } from '@repo/common/classes';
import { iceMap } from '../../map/ice.Map.js';
import iceUserManager from '../managers/ice.user.manager.js';
import { iceGameOverNotification, iceMapSyncNotification } from '../../utils/ice.notifications.js';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { serializeForGate } from '@repo/common/utils';
import { gameState } from '../../constants/gameState.js';

class iceGame extends Game {
  constructor(id, type) {
    super(id, type);

    this.map = iceMap;
    this.gameTimer = iceMap.timer;
    this.timers = {};
    this.startPosition = iceMap.startPosition;
  }

  addUser(users, sessionId) {
    users.forEach((user, index) => {
      //TODO: user.loginId? user.nickName??
      const newUser = iceUserManager.addUser(user.loginId, sessionId, user.sessionId);

      const playerId = index + 1;
      const position = this.startPosition[index].pos;
      const rotation = this.startPosition[index].rot;

      newUser.setPlayer(playerId, position, rotation);
      this.users.push(newUser);
    });

    console.log(`게임내 유저들`, this.users);
  }

  // ! id === loginId
  getUserById(id) {
    return this.users.find((user) => user.id === id);
  }

  getAllUser() {
    return this.users;
  }

  getOtherUsers(id) {
    return this.users.filter((user) => user.id !== id);
  }

  // ! 방장의 세션아이디로 전체 유저들을 조회할 때 사용
  getAllUserBySessionId(sessionId) {
    return this.users.filter((user) => user.player.gameId === sessionId);
  }

  getAllSessionIds() {
    return this.users.map((user) => user.sessionId);
  }

  getOtherSessionIds(id) {
    const users = this.users.filter((user) => user.id !== id);

    return users.map((user) => user.sessionId);
  }

  getUserBySessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  getReadyCounts() {
    return this.users.filter((user) => user.player.isReady === true).length;
  }

  getUserByPlayerId(playerId) {
    return this.users.find((user) => user.player.id === playerId);
  }

  getAliveUsers() {
    return this.users.filter((user) => user.player.state !== 2);
  }

  clearAllPlayers() {
    this.users.forEach((user) => user.player.resetPlayer());
  }

  setState(state) {
    this.state = state;
  }

  changeMap(socket) {
    for (let key in this.map.updateTime) {
      const mapKey = `map${key}`;
      this.timers[mapKey] = setTimeout(() => {
        this.map.sizes.min += 5;
        this.map.sizes.max -= 5;

        const mapInfos = { min: this.map.sizes.min, max: this.map.sizes.max };

        const sessionIds = iceUserManager.getAllSessionIds();

        const message = iceMapSyncNotification(mapInfos);

        const payloadType = getPayloadNameByMessageType(message.type);

        const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

        socket.write(buffer);

        delete this.timers.map1;
      }, this.map.updateTime[key] * 1000);
    }
  }

  iceGameTimer(socket) {
    this.timers.iceGameTimer = setTimeout(() => {
      let aliveUsers = iceUserManager.getAliveUser();

      aliveUsers = aliveUsers.sort((a, b) => b.player.hp - a.player.hp);
      aliveUsers.forEach((user, index) => (user.player.rank = index + 1));

      this.handleGameEnd(socket);
    }, this.gameTimer);
  }

  handleGameEnd(socket) {
    console.log(`게임 종료`);
    // 전체 유저 조회
    const users = iceUserManager.getAllUser();

    const sessionIds = iceUserManager.getAllSessionIds();

    const message = iceGameOverNotification(users);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    socket.write(buffer);

    this.reset();
    this.clearAllPlayers();
  }

  reset() {
    this.map = iceMap;
    this.state = gameState.WAIT;

    for (const key in this.timers) {
      clearTimeout(this.timers[key]); // 타이머 제거
    }

    // 모든 키 삭제
    this.timers = {};
  }
}

export default iceGame;
