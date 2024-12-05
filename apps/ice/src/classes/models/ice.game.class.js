import { Game, IntervalManager, TimeoutManager } from '@repo/common/classes';
import { iceMap } from '../../map/ice.Map.js';
import { iceGameOverNotification, iceMapSyncNotification } from '../../utils/ice.notifications.js';
import { serializeForGate } from '@repo/common/utils';
import { GAME_STATE, USER_STATE } from '../../constants/states.js';
import iceUser from './ice.user.class.js';
import { iceConfig } from '../../config/config.js';
import { logger } from '../../utils/logger.utils.js';
import { redisUtil } from '../../utils/init/redis.js';

class iceGame extends Game {
  constructor(id) {
    super(id);

    this.map = iceMap;
    this.gameTimer = iceMap.timer;
    this.intervalManager = new IntervalManager();
    this.timeoutManager = new TimeoutManager();
    this.startPosition = iceMap.startPosition;
  }

  async addUser(users, gameId) {
    for (let key in users) {
      const userId = users[key];

      const position = this.startPosition[key].pos;
      const rotation = this.startPosition[key].rot;

      const newUser = new iceUser(gameId, userId, position, rotation);

      this.users.push(newUser);
    }

    logger.info(`유저들`, this.users);
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

  isValidUser(userId) {
    return this.users.find((user) => user.sessionId === userId) ? true : false;
  }

  // TODO: GlobalFailCode용 로직
  userValidation(user) {
    if (this.users.includes(user)) {
      const failCode = iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND;

      return failCode;
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

  isOneAlive() {
    // * 살아남은 유저 수 확인
    return this.getAliveUsers().length <= 1 ? true : false;
  }

  clearAllPlayers() {
    // * 모든 유저 위치 제거 ( 미니 게임 정상 종료시 )
    this.users.forEach((user) => {
      redisUtil.deleteUserLocationField(user.sessionId, 'ice');
      user.resetInfo();
    });
  }

  setGameState(state) {
    this.state = state;
  }

  getMapSize() {
    return this.map.sizes;
  }

  changeMapTimer(socket) {
    for (let key in this.map.updateTime) {
      const mapKey = `map${key}`;

      // ! timeOut 추가
      this.timeoutManager.addTimeout(
        'changeMapTimer',
        () => {
          logger.info(`[changeMapTimer] ==>, ${mapKey}`);

          this.map.sizes.min += 5;
          this.map.sizes.max -= 5;

          const sessionIds = this.getAllSessionIds();

          const message = iceMapSyncNotification();

          logger.info(`iceMapTimer 메시지`, message);

          const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

          socket.write(buffer);
        },
        this.map.updateTime[key] * 1000,
        'changeMap',
      );
    }
  }

  iceGameTimer(socket) {
    // ! timeOut 추가
    this.timeoutManager.addTimeout(
      'iceGameTimer',
      () => {
        logger.info(`[iceGameTimer] ===> 게임 종료`);
        let aliveUsers = this.getAliveUsers();

        // * 살아있는 체력 순으로 내림차순 정렬 후, rank
        aliveUsers = aliveUsers.sort((a, b) => b.hp - a.hp);
        aliveUsers.forEach((user, index) => (user.rank = index + 1));

        logger.info(`iceGameTimer`, aliveUsers);

        this.handleGameEnd(socket);
      },
      this.gameTimer,
      'iceGameTimer',
    );
  }

  // * 살아있는 유저들 수 확인
  checkGameOverInterval(socket) {
    // ! interval 추가
    this.intervalManager.addInterval(
      'gameOverInterval',
      () => {
        if (this.isOneAlive()) {
          logger.info(`[checkGameOverInterval] ===> 게임 종료`);
          const user = this.getAliveUsers()[0];

          if (!user) {
            user.rank = 1;
          }

          logger.info(user);

          this.handleGameEnd(socket);
        }
      },
      1000,
      'checkGameOver',
    );
  }

  handleGameEnd(socket) {
    // * 게임 종료
    logger.info(`[handleGameEnd] ===> 게임 종료`);
    // 전체 유저 조회
    const users = this.getAllUser();

    const sessionIds = this.getAllSessionIds();

    const message = iceGameOverNotification(users);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    socket.write(buffer);

    this.reset();
    this.clearAllPlayers();
  }

  reset() {
    // * 게임 내 정보 리셋
    this.map = iceMap;
    this.setGameState(GAME_STATE.WAIT);

    this.timeoutManager.clearAll();
    this.intervalManager.clearAll();
  }
}

export default iceGame;
