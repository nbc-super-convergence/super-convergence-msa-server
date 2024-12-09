import { Game, IntervalManager } from '@repo/common/classes';
import { dropperMap } from '../../map/dropper.Map.js';
import dropperUser from './dropper.user.class.js';
import { redisUtil } from '../../../utils/redis.js';
import { logger } from '../../../utils/logger.utils.js';
import { GAME_STATE, USER_STATE } from '../../constants/state.js';
import { serializeForGate } from '@repo/common/utils';
import { dropGameOverNotification } from '../../../utils/dropper.notificaion.js';

export const sessionIds = new Map();

class dropperGame extends Game {
  constructor(id) {
    super(id);

    // ! 종료시간이 정해져있는 게임은 아님
    // TODO: 시작 위치에 대해서 다시 확인해보기(0,2,6,8)
    this.intervalManager = new IntervalManager();
    this.startPosition = dropperMap.startPosition;
    this.slots = new Array(9).fill(false);
    this.stage = 0;
    //! timeOut? interval?
    this.moveTimer;
    this.fallTimer;
    this.startMoveTimer;
  }

  async addUser(users, gameId) {
    for (let key in users) {
      const userId = users[key];

      const slot = this.startPosition[key].pos;
      const rotation = this.startPosition[key].rot;

      if (!sessionIds.get(userId)) {
        sessionIds.set(userId, gameId);
      }

      const newUser = new dropperUser(gameId, userId, slot, rotation);

      this.users.push(newUser);
    }
  }

  getUserBySessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  removeUser(sessionId) {
    const index = this.users.findIndex((user) => user.sessionId === sessionId);

    if (index !== -1) {
      return this.users.splice(index, 1);
    }
  }

  getAllUser() {
    return this.users;
  }

  getAllSessionIds() {
    return this.users.map((user) => user.sessionId);
  }

  getOtherSessionIds(sessionId) {
    const users = this.users.filter((user) => user.sessionId !== sessionId);

    return users.map((user) => user.sessionId);
  }

  isAllReady() {
    return this.users.filter((user) => user.isReady === true).length === this.users.length;
  }

  getAliveUsers() {
    return this.users.filter((user) => user.state !== USER_STATE.DIE);
  }

  isValidUser(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId) ? true : false;
  }

  isOneAlive() {
    // * 살아남은 유저 수 확인
    return this.getAliveUsers().length <= 1 ? true : false;
  }

  clearAllPlayers() {
    // * 모든 유저 위치 제거 ( 미니 게임 정상 종료시 )
    this.users.forEach(async (user) => {
      await redisUtil.deleteUserLocationField(user.sessionId, 'dropper');
      logger.info(`[clearAllPlayers] ===>`, user.startInfos);
      user.resetInfo();
    });
  }

  setGameState(state) {
    this.state = state;
  }

  checkUserInSlot(slot) {
    return this.slots[slot] === true ? true : false;
  }

  userMoveTimer() {}
  fallenTimer() {}

  handleGameEnd(socket) {
    // * 게임 종료
    logger.info(`[handleGameEnd] ===> 게임 종료`);
    // 전체 유저 조회
    const users = this.getAllUser();

    const sessionIds = this.getAllSessionIds();

    const message = dropGameOverNotification(users);

    logger.info(`[handleGameEnd - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    socket.write(buffer);

    this.reset();
    this.clearAllPlayers();
  }

  reset() {
    // * 게임 내 정보 리셋
    this.stage = 0;
    this.slots = new Array(9).fill(false);
    this.setGameState(GAME_STATE.WAIT);

    this.intervalManager.clearAll();
  }
}

export default dropperGame;
