import DanceGame from '../models/dance.game.class.js';
import { logger } from '../../utils/logger.utils.js';
import { createNotification } from '../../utils/create.notification.js';
import { GAME_STATE, MESSAGE_TYPE } from '../../utils/constants.js';
import { createResponse } from '../../utils/create.response.js';
import { redis } from '../../init/redis.js';

class DanceGameManager {
  constructor() {
    if (DanceGameManager.instance) {
      return DanceGameManager.instance;
    }

    this.games = new Map(); //* 게임 ID를 키로 사용 gameId -> game
    this.sessionIds = new Map(); //* 세션 ID를 키로 사용 sessionId -> gameId
    DanceGameManager.instance = this;
  }

  static getInstance() {
    if (!DanceGameManager.instance) {
      DanceGameManager.instance = new DanceGameManager();
    }
    return DanceGameManager.instance;
  }

  createGame(gameId, users) {
    //* 게임 생성
    const game = new DanceGame(gameId);
    const arrUsers = Array.from(users);

    try {
      //* 팀 배정
      if (arrUsers.length > 3) {
        //* 유저 배열을 랜덤하게 섞기
        const shuffledUsers = arrUsers
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

        //* 섞인 순서대로 2:2 팀 배정
        shuffledUsers.forEach((user, idx) => {
          const teamNumber = idx < 2 ? 1 : 2;
          game.addUser(user, teamNumber);
          this.sessionIds.set(user, gameId);
        });
      } else {
        //* 3명 이하일 경우 각자 다른 팀 번호
        arrUsers.forEach((user, idx) => {
          game.addUser(user, idx + 1);
          this.sessionIds.set(user, gameId);
        });
      }

      this.games.set(gameId, game);
      return game;
    } catch (error) {
      logger.error('[ createGame ] ====> error', { error });
    }
  }

  deleteGame(gameId) {
    const game = this.games.get(gameId);

    if (game) {
      //* 타이머만 정리
      game.timers.forEach((timer) => clearTimeout(timer));
      game.timers.clear();

      //* 게임 상태 초기화
      game.resetGameData();
    }
  }

  getGameByGameId(gameId) {
    if (!gameId) {
      logger.error('[ getGameByGameId ] ====> gameId is undefined', { gameId });
      return null;
    }

    const game = this.games.get(gameId);
    if (!game) {
      logger.error('[ getGameByGameId ] ====> game not found', { gameId });
      return null;
    }

    return game;
  }

  getGameIdBySessionId(sessionId) {
    const gameId = this.sessionIds.get(sessionId);
    if (!gameId) {
      logger.error('[ getGameIdBySessionId ] ====> gameId not found', { sessionId });
      return null;
    }

    return gameId;
  }

  getGameBySessionId(sessionId) {
    const gameId = this.getGameIdBySessionId(sessionId);
    const game = this.getGameByGameId(gameId);

    return game;
  }

  danceKeyPressResponse(result, sessionId) {
    return createResponse(result, MESSAGE_TYPE.DANCE_KEY_PRESS_RESPONSE, sessionId);
  }

  danceKeyPressNoti(sessionId, result, game) {
    logger.info(`[DanceGameManager - danceKeyPressNoti] result:`, result);

    const sessionIds = game.getOtherSessionIds(sessionId);
    logger.info(`[danceKeyPressNoti] ===> sessionIds `, sessionIds);

    const user = game.getUser(sessionId);

    return createNotification(
      {
        teamNumber: user.teamNumber,
        correct: result.data,
        state: result.state,
      },
      MESSAGE_TYPE.DANCE_KEY_PRESS_NOTIFICATION,
      sessionIds,
    );
  }

  miniGameReadyNoti(game) {
    logger.info(`[DanceGameManager - miniGameReadyNotification]`);

    //* 게임 상태 변경
    game.setGameState(GAME_STATE.START);

    const sessionIds = game.getAllSessionIds();
    logger.info(`[miniGameReadyNotification] ===> sessionIds `, sessionIds);

    const users = game.getAllUsers();
    logger.info(`[miniGameReadyNotification] ===> users `, users);

    return createNotification(users, MESSAGE_TYPE.DANCE_MINI_GAME_READY_NOTIFICATION, sessionIds);
  }

  danceReadyNoti(sessionId, game) {
    logger.info(`[DanceGameManager - danceReadyNoti]`);

    const sessionIds = game.getOtherSessionIds(sessionId);
    logger.info(`[danceReadyNoti] ===> sessionIds `, sessionIds);

    return createNotification(sessionId, MESSAGE_TYPE.DANCE_READY_NOTIFICATION, sessionIds);
  }

  danceStartNoti(game) {
    logger.info(`[DanceGameManager - danceStartNoti]`);

    const sessionIds = game.getAllSessionIds();
    logger.info(`[danceStartNoti] ===> sessionIds `, sessionIds);

    //* 게임 시작
    game.startGame();

    const startTime = Date.now();

    return createNotification(startTime, MESSAGE_TYPE.DANCE_START_NOTIFICATION, sessionIds);
  }

  danceTableNoti(dancePools, game) {
    logger.info(`[DanceGameManager - danceTableNoti]`);

    const sessionIds = game.getAllSessionIds();
    logger.info(`[danceTableNoti] ===> sessionIds `, sessionIds);

    return createNotification(dancePools, MESSAGE_TYPE.DANCE_TABLE_NOTIFICATION, sessionIds);
  }

  async danceGameOverNoti(game) {
    logger.info(`[DanceGameManager - danceGameOverNoti]`);

    const results = game.getGameResults();
    logger.info(`[danceGameOverNoti] ===> sessionIds `, results);

    const sessionIds = game.getAllSessionIds();
    logger.info(`[danceGameOverNoti] ===> sessionIds `, sessionIds);

    const REWARD = {
      0: 20, //* 1등
      1: 10, //* 2등
      2: 5, //* 3등
      3: 1, //* 4등
    };

    //* 유저 위치 정보 삭제
    try {
      const pipeline = redis.client.pipeline();
      results.TeamRank.forEach((teamNumber, rank) => {
        const teamResult = results.result[rank];
        const reward = REWARD[rank] || 0;

        teamResult.sessionId.forEach((id) => {
          pipeline.hincrby(`${redis.prefix.BOARD_PLAYER_INFO}:${game.id}:${id}`, 'gold', reward);
          pipeline.hdel(`${redis.prefix.LOCATION}:${id}`, 'dance');
        });
      });
      await pipeline.exec();
    } catch (error) {
      logger.error(`[danceGameOverNoti] ===> redis pipeline error `, error);
    }

    //* 게임 데이터 초기화
    this.deleteGame(game.id);

    return createNotification(results, MESSAGE_TYPE.DANCE_GAME_OVER_NOTIFICATION, sessionIds);
  }
}

const danceGameManagerInstance = DanceGameManager.getInstance();
Object.freeze(danceGameManagerInstance);

export default danceGameManagerInstance;
