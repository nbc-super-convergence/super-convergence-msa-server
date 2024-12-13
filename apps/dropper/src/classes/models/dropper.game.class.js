import { Game, IntervalManager, TimeoutManager } from '@repo/common/classes';
import { dropperMap } from '../../map/dropper.Map.js';
import dropperUser from './dropper.user.class.js';
import { redisUtil } from '../../utils/redis.js';
import { logger } from '../../utils/logger.utils.js';
import { GAME_STATE, USER_STATE } from '../../constants/state.js';
import { serializeForGate } from '@repo/common/utils';
import {
  dropGameOverNotification,
  dropLevelEndNotification,
  dropLevelStartNotification,
  dropPlayerDeathNotification,
} from '../../utils/dropper.notificaion.js';
import { calculateGoldByRank } from '../../utils/calculate.gold.js';

export const sessionIds = new Map();

class dropperGame extends Game {
  constructor(id) {
    super(id);

    // ! 종료시간이 정해져있는 게임은 아님
    // TODO: 시작 위치에 대해서 다시 확인해보기(0,2,6,8)
    this.intervalManager = new IntervalManager();
    this.timeoutManager = new TimeoutManager();
    this.startPosition = dropperMap.startPosition;
    this.slots = new Array(9).fill(false);
    this.stage = 1;
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

      // * 유저가 있는 슬롯은 true로 초기화
      this.slots[slot] = true;

      this.users.push(newUser);
    }
  }

  getUserBySessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  removeUser(sessionId) {
    const index = this.users.findIndex((user) => user.sessionId === sessionId);

    // * 유저 탈주시 슬롯 제거
    this.removeSlot(this.users[index].slot);

    if (index !== -1) {
      return this.users.splice(index, 1);
    }
  }

  getAllUsers() {
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
    if (this.users.size <= 0) {
      return false;
    }

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
      user.resetInfo();
      logger.info(`[user - startInfos] ===>`, user.startInfos);
      logger.info(`[user - slot]`, user.slot);
      logger.info(`[user - rank]`, user.rank);
      logger.info(`[user - isReady]`, user.isReady);
    });
  }

  setGameState(state) {
    this.state = state;
  }

  checkUserInSlot(slot) {
    return this.slots[slot] === true ? true : false;
  }

  updateSlot(user, slot) {
    this.slots[user.slot] = false;
    this.slots[slot] = true;
    logger.info(`업데이트 슬롯`, this.slots);
  }

  removeSlot(slot) {
    this.slots[slot] = false;
  }

  checkUserInFloor(holes) {
    return this.users.filter((user) => !holes.includes(user.slot) && !user.isDead());
  }

  // ! 유저는 10초 동안 움직일 수 있다.
  // ! 바닥이 부숴진다.
  // ! 3초동안 떨어진다.
  breakFloorInterval(socket) {
    this.intervalManager.addInterval(
      'breakFloor',
      () => {
        // ! 0 ~ 8 중 8 - 현재 스테이지 수의 랜덤 값 추출
        const holes = [];
        // * 랜덤 숫자 생성 ( 중복 방지 )
        while (holes.length < 9 - this.stage) {
          const randomNumber = Math.floor(Math.random() * 9);
          if (!holes.includes(randomNumber)) {
            holes.push(randomNumber);
          }
        }

        // * 바닥 부숨
        const sessionIds = this.getAllSessionIds();

        const message = dropLevelEndNotification(holes);

        logger.info(`[dropLevelEndNotification - message] : `, message);

        const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

        socket.write(buffer);

        // * 3초 동안 떨어지고 난 후,
        this.fallen(socket, holes);
      },
      10000,
      'breakFloor',
    );
  }

  fallen(socket, holes) {
    // * 남은 플레이어 사망
    const users = this.checkUserInFloor(holes);

    for (let key in users) {
      logger.info(`[fallen - 남아있는 유저id]:` + users[key].sessionId + ' ' + users[key].slot);
    }

    // ? 그 층에 있던 모든 유저에게 같은 랭크 부여하기
    const rank = this.getAliveUsers().length;

    logger.info(`[fallen - rank] : ` + rank);

    if (users) {
      for (let key in users) {
        const user = users[key];

        user.Dead();

        user.rank = rank;

        // * 사용중인 slot 삭제
        if (user.slot) {
          // ? 죽은 유저의 slot 삭제
          this.removeSlot(user.slot);

          // * 임시로 -1로 처리
          user.slot = -1;
        }

        const sessionIds = this.getAllSessionIds();

        const message = dropPlayerDeathNotification(user);

        logger.info(`[dropPlayerDeathNotification - message]`, message);

        // TODO: 현재 어떤 스테이지인지를 sequence로 보내야하는지? -> this.stage
        const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

        socket.write(buffer);
      }
    }

    // TODO: 떨어지면서 기존의 위치를 유지를 해야함
    this.stage++;
    // TODO: 기존 위치를 유지하기 위해서 전부다 지우지는 않음, 추후에 새롭게 변경해야할 수도 있음.
    //this.slots = new Array(9).fill(false);
  }

  checkGameOverInterval(socket) {
    this.intervalManager.addInterval(
      'checkGameOver',
      () => {
        if (this.stage === 9 || this.isOneAlive()) {
          const aliveUsers = this.getAliveUsers();

          logger.info(`[checkGameOverInterval - aliveUsers]`, aliveUsers);

          if (aliveUsers) {
            // ? 마지막 살아남은 모든 유저가 1등
            const rank = 1;

            // ? 혹시나 추후에 게임 구조가 변경될 수도 있으므로 이렇게 처리
            for (let key in aliveUsers) {
              const user = aliveUsers[key];

              user.rank = rank;
            }
          }

          //! 타임아웃 추가하면 4초동안 interval 4번도는 버그 생김
          this.handleGameEnd(socket);
        }
      },
      1000,
      'checkGameOver',
    );
  }

  async handleGameEnd(socket) {
    // * 게임 종료
    logger.info(`[handleGameEnd] ===> 게임 종료`);
    // 전체 유저 조회
    const users = this.getAllUsers();

    const sessionIds = this.getAllSessionIds();

    //const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${board.boardId}:${sessionId}`;

    // ! 레디스로 골드 업데이트
    for (let key in users) {
      let playerInfos = await redisUtil.getBoardPlayerinfo(this.id, users[key].sessionId);

      logger.info(`[gameEnd - user.sessionId]` + users[key].sessionId);

      logger.info(`[gameEnd - playerInfos.gold]:` + playerInfos.gold);

      const updateGold = calculateGoldByRank(playerInfos.gold, users[key].rank);

      logger.info(`[gameEnd - playerInfos.gold]:` + updateGold);

      await redisUtil.updateBoardPlayerGold(this.id, users[key].sessionId, updateGold);
    }

    const message = dropGameOverNotification(users);

    logger.info(`[handleGameEnd - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    socket.write(buffer);

    this.reset();
    this.clearAllPlayers();
  }

  reset() {
    // * 게임 내 정보 리셋
    this.stage = 1;

    this.slots = new Array(9).fill(false);

    this.users.forEach((user) => {
      this.slots[user.startInfos.slot] = true;
    });

    this.setGameState(GAME_STATE.WAIT);

    logger.info(`[reset - stage]`, this.stage);
    logger.info(`[reset - slots]`, this.slots);
    logger.info(`[reset - state]`, this.state);

    this.intervalManager.clearAll();
    // TODO: timeout이 실행되고나서 게임이 종료가 되었을 수도 있음
    //this.timeoutManager.clearAll();
  }
}

export default dropperGame;
