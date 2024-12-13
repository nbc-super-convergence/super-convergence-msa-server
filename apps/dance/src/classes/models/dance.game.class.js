import { Game, ResponseHelper } from '@repo/common/classes';
import { logger } from '../../utils/logger.utils.js';
import DanceUser from './dance.user.class.js';
import { config } from '@repo/common/config';
import { danceConfig } from '../../config/config.js';
import danceGameManager from '../manager/dance.manager.js';

const { FAIL_CODE, STATE } = config;
const { GAME_STATE, REASON, DIRECTION } = danceConfig;

class DanceGame extends Game {
  constructor(id) {
    super(id);
    this.users = new Map(); //* 유저의 세션 ID -> 유저 클래스
    this.dancePools = new Map(); //* 현재 게임의 춤표 풀
    this.teamResults = new Map(); //* teamNumber -> { sessionId, score, endTime }
    this.timers = new Map(); //* 타이머 관리
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
    //* 타이머 정리
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    //* 유저 ready 상태 초기화
    this.users.forEach((user) => {
      user.isReady = false;
      user.setState(STATE.DANCE_WAIT);
    });

    //* 팀 결과 초기화
    this.teamResults.forEach((result, teamNumber) => {
      this.teamResults.set(teamNumber, {
        sessionId: result.sessionId,
        score: 0,
        endTime: 0,
      });
    });

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
    if (state) {
      this.state = state;
    }
  }

  clearTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  startGameTimer(socket) {
    if (!socket) {
      logger.error('[ startGameTimer ] ====> sockt is undefined', { socket });
      return null;
    }

    if (this.timers.has('gameTimer')) {
      clearTimeout(this.timers.get('gameTimer'));
    }

    const timer = setTimeout(async () => {
      try {
        if (this.state !== GAME_STATE.WAIT) {
          this.endGame(REASON.TIME_OVER);
          const gameOverBuffer = await danceGameManager.danceGameOverNoti(this);
          if (!socket.destroyed) {
            socket.write(gameOverBuffer);
          }
        }
      } catch (error) {
        logger.error('[ startGameTimer ] ====> Game timer error', error);
      }
    }, 120000);

    this.timers.set('gameTimer', timer);
  }

  setDancePools(dancePools) {
    if (!Array.isArray(dancePools)) {
      logger.error('[ setDancePools ] ====> invalid dancePools format', { dancePools });
      return;
    }

    // dancePools의 구조:
    // [
    //   {
    //     teamNumber: int,
    //     danceTables: [
    //       {
    //         commands: [
    //           { direction: number, targetSessionId: 2 },
    //           { direction: number, targetSessionId: 2 },
    //           { direction: number, targetSessionId: 2 },
    //           { direction: number, targetSessionId: 2 },
    //           ...
    //         ]
    //       },
    //       ...
    //     ]
    //   },
    //   ...
    // ]

    try {
      dancePools.forEach((pool) => {
        if (!pool.teamNumber || !Array.isArray(pool.danceTables)) {
          throw new Error('[ setDancePools ] ====> Invalid pool structure');
        }

        //* 팀별로 춤표 저장
        this.dancePools.set(pool.teamNumber, {
          danceTables: pool.danceTables.map((table) => {
            if (!Array.isArray(table.commands)) {
              throw new Error('[ setDancePools ] ====> Invalid table structure');
            }

            return {
              commands: table.commands.map((command) => ({
                direction: command.direction,
                targetSessionId: command.targetSessionId,
              })),
            };
          }),
          currentTableIndex: 0,
          currentCommandIndex: 0,
        });
      });
    } catch (error) {
      logger.error('[ setDancePools ] ====> error setting dance pools', { error });
      this.dancePools.clear();
    }
  }

  getCurrentCommand(user) {
    if (!user || !user.teamNumber) {
      logger.error('[ getCurrentCommand ] ====> invalid user', { user });
      return null;
    }

    const pool = this.dancePools.get(user.teamNumber);
    if (!pool) {
      logger.error('[ getCurrentCommand ] ====> pool not found', { teamNumber: user.teamNumber });
      return null;
    }

    const currentTable = pool.danceTables[pool.currentTableIndex];
    if (!currentTable) {
      logger.error('[ getCurrentCommand ] ====> invalid table', { pool });
      return null;
    }

    return currentTable.commands[pool.currentCommandIndex];
  }

  moveToNextCommand(user) {
    if (!user?.teamNumber) {
      logger.error('[ moveToNextCommand ] ====> user.teamNumber is undefined', { user });
      return false;
    }

    const pool = this.dancePools.get(user.teamNumber);
    if (!pool?.danceTables) {
      logger.error('[ moveToNextCommand ] ====> pool.danceTables is undefined', { user });
      return false;
    }

    pool.currentCommandIndex++;
    const currentTable = pool.danceTables[pool.currentTableIndex];

    if (currentTable && pool.currentCommandIndex >= currentTable.commands.length) {
      //* 현재 테이블의 모든 커맨드 완료
      pool.currentTableIndex++;
      pool.currentCommandIndex = 0;

      if (pool.currentTableIndex >= pool.danceTables.length) {
        //* 모든 테이블 완료
        return true;
      }
    }
    return false;
  }

  validateKeyPress(sessionId, pressKey) {
    const user = this.getUser(sessionId);
    if (!user) {
      return ResponseHelper.fail(FAIL_CODE.USER_NOT_FOUND, false, { state: STATE.DANCE_FAIL });
    }

    const currentCommand = this.getCurrentCommand(user);
    if (!currentCommand) {
      return ResponseHelper.fail(FAIL_CODE.INVALID_TEAM_NUMBER, false, { state: STATE.DANCE_FAIL });
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
    if (!sessionId || !endTime) {
      logger.error('[ handleTableComplete ] ====> invalid params', { sessionId, endTime });
      return false;
    }

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

    try {
      teamResult.score += 100;
      teamResult.endTime = endTime;

      const isTeamComplete = this.isTeamComplete(user.teamNumber);
      if (isTeamComplete) {
        this.endGame(REASON.COMPLETE);
        return true;
      }
    } catch (error) {
      logger.error('[ handleTableComplete ] ====> error updating score', { error });
      return false;
    }

    return false;
  }

  isTeamComplete(teamNumber) {
    const pool = this.dancePools.get(teamNumber);
    if (!pool) return false;

    return pool.currentTableIndex >= pool.danceTables.length;
  }

  isAllReady() {
    logger.info('[ isAllReady ] ====> error updating score', { size: this.users.size });
    if (this.users.size < 1) {
      return false;
    }

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

  async handleDisconnect(sessionId) {
    const disconnectedUser = this.getUser(sessionId);
    if (!disconnectedUser) {
      logger.error('[ handleDisconnect ] ====> user not found', { sessionId });
      return null;
    }

    //* 나간 유저의 팀원
    const teammate = Array.from(this.users.values()).find(
      (user) => user.teamNumber === disconnectedUser.teamNumber && user.sessionId !== sessionId,
    );

    //* 팀전에서만 대체 플레이어 찾기
    if (teammate) {
      //* 입력 대상을 남은 팀원으로 변경
      const dancePool = this.dancePools.get(disconnectedUser.teamNumber);
      if (!dancePool?.danceTables) {
        logger.error('[ handleDisconnect ] ====> invalid dancePool', {
          teamNumber: disconnectedUser.teamNumber,
        });
        return null;
      }

      try {
        const updatedTables = dancePool.danceTables.map((table) => ({
          commands: table.commands.map((command) => ({
            direction: command.direction,
            targetSessionId:
              command.targetSessionId === sessionId ? teammate.sessionId : command.targetSessionId,
          })),
        }));

        this.dancePools.set(disconnectedUser.teamNumber, {
          danceTables: updatedTables,
          currentTableIndex: dancePool.currentTableIndex,
          currentCommandIndex: dancePool.currentCommandIndex,
        });
      } catch (error) {
        logger.error('[ handleDisconnect ] ====> error updating dancePool', { error });
      }
    } else {
      //* 팀 결과 삭제
      const teamResult = this.teamResults.get(disconnectedUser.teamNumber);
      if (teamResult) {
        teamResult.sessionId = teamResult.sessionId.filter((id) => id != sessionId);
        if (teamResult.sessionId.length === 0) {
          this.teamResults.delete(disconnectedUser.teamNumber);
        }
      }
    }

    //* 유저 삭제
    this.users.delete(sessionId);

    return {
      disconnectedSessionId: sessionId,
      replacementSessionId: teammate.sessionId,
    };
  }
}

export default DanceGame;
