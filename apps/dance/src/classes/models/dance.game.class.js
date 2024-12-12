import { Game, ResponseHelper, TimeoutManager } from '@repo/common/classes';
import { logger } from '../../utils/logger.utils.js';
import DanceUser from './dance.user.class.js';
import { config } from '@repo/common/config';
import { danceConfig } from '../../config/config.js';

const { FAIL_CODE, STATE } = config;
const { GAME_STATE, REASON, DIRECTION } = danceConfig;

class DanceGame extends Game {
  constructor(id) {
    super(id);
    this.users = new Map(); //* 유저의 세션 ID -> 유저 클래스
    this.dancePools = new Map(); //* 현재 게임의 춤표 풀
    this.teamResults = new Map(); //* teamNumber -> { sessionId, score, endTime }
    this.state = GAME_STATE.WAIT;
    this.reason = REASON.TIME_OVER;
  }

  startGame() {
    this.state = GAME_STATE.START;
  }

  endGame(reason) {
    this.reason = reason;
    this.state = GAME_STATE.WAIT;
  }

  resetGameData() {
    this.users.clear();
    this.dancePools.clear();
    this.teamResults.clear();
    this.state = GAME_STATE.WAIT;
    this.reason = REASON.TIME_OVER;
  }

  addUser(sessionId, teamNumber) {
    //* 인자 검증
    if (!sessionId || !teamNumber) {
      throw new Error('[ addUser ] ====> args is undefined');
    }

    //* 게임에 유저 등록
    const user = new DanceUser(this.id, sessionId, teamNumber);
    this.users.set(sessionId, user);

    //* teamResults 초기화
    if (!this.teamResults.has(teamNumber)) {
      this.teamResults.set(teamNumber, {
        sessionId: [],
        score: 0,
        endTime: 0,
      });
    }

    this.teamResults.get(teamNumber).sessionId.push(sessionId);
  }

  getUser(sessionId) {
    //* 인자 검증
    if (!sessionId) {
      logger.error('[ getUser ] ====> sessionId is undefined', { sessionId });
      return null;
    }

    //* 유저 검증
    const user = this.users.get(sessionId);
    if (!user) {
      logger.error('[ getUser ] ====> user not found', { sessionId });
      return null;
    }

    return user;
  }

  getAllUsers() {
    //* 유저 검증
    const users = Array.from(this.users.values());
    if (users.length <= 0) {
      logger.error('[ getAllUsers ] ====> no users');
      return [];
    }

    return users;
  }

  getPlayerInfos() {
    //* 유저 검증
    const users = Array.from(this.users.values());
    if (users.length <= 0) {
      logger.error('[ getPlayerInfos ] ====> no users');
      return [];
    }

    return users.map((user) => ({
      sessionId: user.sessionId,
      teamNumber: user.teamNumber,
    }));
  }

  getAllSessionIds() {
    return Array.from(this.users.keys());
  }

  getOtherSessionIds(sessionId) {
    const users = Array.from(this.users.keys());

    return users.filter((id) => id !== sessionId);
  }

  setGameState(state) {
    this.state = state;
  }

  setDancePools(dancePools) {
    if (!Array.isArray(dancePools)) {
      logger.error('[ setDancePools ] ====> invalid dancePools format', { dancePools });
      return;
    }

    // dancePools의 구조:
    // [
    //   {
    //     sessionId: string,
    //     danceTables: [
    //       {
    //         commands: [
    //           { direction: number, targetSessionId: string },
    //           ...
    //         ]
    //       },
    //       ...
    //     ]
    //   },
    //   ...
    // ]

    dancePools.forEach((pool) => {
      //* 팀별로 춤표 저장
      if (!this.dancePools.has(pool.teamNumber)) {
        this.dancePools.set(pool.teamNumber, {
          tables: pool.danceTables.map((table) => ({
            commands: [...table.commands],
          })),
          currentTableIndex: 0,
          currentCommandIndex: 0,
        });
      }
    });
  }

  getCurrentCommand(user) {
    const pool = this.dancePools.get(user.teamNumber);
    if (!pool) return null;

    const currentTable = pool.tables[pool.currentTableIndex];
    if (!currentTable) return null;

    return currentTable.commands[pool.currentCommandIndex];
  }

  moveToNextCommand(user) {
    const pool = this.dancePools.get(user.teamNumber);
    if (!pool) return false;

    pool.currentCommandIndex++;
    const currentTable = pool.tables[pool.currentTableIndex];

    if (currentTable && pool.currentCommandIndex >= currentTable.commands.length) {
      //* 현재 테이블의 모든 커맨드 완료
      pool.currentTableIndex++;
      pool.currentCommandIndex = 0;

      if (pool.currentTableIndex >= pool.tables.length) {
        //* 모든 테이블 완료
        return true;
      }
    }
    return false;
  }

  validateKeyPress(sessionId, pressKey) {
    const user = this.getUser(sessionId);
    if (!user) {
      return ResponseHelper.fail(FAIL_CODE.UNKNOWN_ERROR, false, { state: STATE.DANCE_FAIL });
    }

    const currentCommand = this.getCurrentCommand(user);
    if (!currentCommand) {
      return ResponseHelper.fail(FAIL_CODE.UNKNOWN_ERROR, false, { state: STATE.DANCE_FAIL });
    }

    logger.info('[ validateKeyPress ] ====> dancePools', this.dancePools.get(sessionId));
    logger.info('[ validateKeyPress ] ====> currentCommand', currentCommand);

    const isValid =
      currentCommand.targetSessionId === sessionId && currentCommand.direction === pressKey;

    logger.info('[ validateKeyPress ] ====> isValid', {
      targetSessionId: currentCommand.targetSessionId,
      sessionId,
      direction: currentCommand.direction,
      pressKey,
    });

    if (isValid) {
      let state;

      switch (pressKey) {
        case DIRECTION.UP:
          state = STATE.DANCE_UP;
          break;
        case DIRECTION.DOWN:
          state = STATE.DANCE_DOWN;
          break;
        case DIRECTION.LEFT:
          state = STATE.DANCE_LEFT;
          break;
        case DIRECTION.RIGHT:
          state = STATE.DANCE_RIGHT;
          break;
        default:
          state = STATE.DANCE_FAIL;
      }
      user.setState(state);

      this.moveToNextCommand(user);
      return ResponseHelper.success(true, { state });
    }

    user.setState(STATE.DANCE_FAIL);
    return ResponseHelper.success(false, { state: STATE.DANCE_FAIL });
  }

  handleTableComplete(sessionId, endTime) {
    const user = this.getUser(sessionId);
    if (!user) {
      logger.error('[ handleTableComplete ] ====> user not found', { sessionId });
      return false;
    }

    const teamResult = this.teamResults.get(user.teamNumber);
    if (!teamResult) {
      logger.error('[ handleTableComplete ] ====> teamResult not found', { sessionId });
      return false;
    }

    teamResult.score += 100;
    teamResult.endTime = endTime;

    const isTeamComplete = this.isTeamComplete(user.teamNumber);
    if (isTeamComplete) {
      this.endGame(REASON.COMPLETE);
      return true;
    }

    return false;
  }

  isTeamComplete(teamNumber) {
    const pool = this.dancePools.get(teamNumber);
    if (!pool) return false;

    return pool.currentTableIndex >= pool.tables.length;
  }

  isAllReady() {
    return Array.from(this.users.values()).every((user) => user.isReady);
  }

  getGameResults() {
    //* teamResults를 배열로 변환하고 정렬
    const sortedResults = Array.from(this.teamResults.entries()).sort(([, a], [, b]) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.endTime - b.endTime;
    });

    return {
      TeamRank: sortedResults.map(([teamNumber]) => teamNumber),
      result: sortedResults.map(([, result]) => result),
      reason: this.reason,
      endTime: Date.now(),
    };
  }

  handleDisconnect(sessionId) {
    const disconnectedUser = this.getUser(sessionId);
    if (!disconnectedUser) return null;

    //* 팀전에서만 대체 플레이어 찾기
    if (this.users.size > 3) {
      const teammate = Array.from(this.users.values()).find(
        (user) => user.teamNumber === disconnectedUser.teamNumber && user.sessionId !== sessionId,
      );

      if (teammate) {
        return {
          disconnectedSessionId: sessionId,
          replacementSessionId: teammate.sessionId,
        };
      }
    }

    return null;
  }
}

export default DanceGame;
