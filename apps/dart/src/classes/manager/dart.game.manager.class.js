import { serializeForGate } from '@repo/common/utils';
import { MESSAGE_TYPE } from '@repo/common/header';
import { GAME_STATE } from '../../constants/state.js';
import { logger } from '../../utils/logger.utils.js';
import DartGame from '../models/dart.game.class.js';
import { FAIL_CODE } from '@repo/common/failcodes';
import { redisUtil } from '../../utils/init/redis.js';

class DartGameManager {
  constructor() {
    if (DartGameManager.instance) {
      return DartGameManager.instance;
    }

    this.games = [];
  }

  static getInstance() {
    if (!DartGameManager.instance) {
      DartGameManager.instance = new DartGameManager();
    }
    return DartGameManager.instance;
  }

  async addGame(gameId, users) {
    const game = new DartGame(gameId);

    logger.info(`[DART: DartGameManager] users ===>> `, users);
    logger.info(`[DART: DartGameManager] game ===>> `, game);

    await game.addUser(users, gameId);
    this.games.push(game); // 게임 세션에 추가
  }
  //

  getGameById(gameId) {
    return this.games.find((game) => game.id === gameId);
  }

  /**
   * * 모든 게임 조회
   * @returns
   */
  getAllGames() {
    return this.games;
  }

  /**
   * * 게임 검증
   * @param {String} gameId
   * @returns
   */
  isValidGame(gameId) {
    return this.games.find((game) => game.id === gameId) ? true : false;
  }

  /**
   * * 게임 준비 Notification
   * @param {DartGame} game
   * @returns
   */
  async makeMiniGameReadyNoti(game) {
    //
    logger.info(`[ DART: makeMiniGameReadyNoti ] game.id ===>> `, game.id);
    game.setGameState(GAME_STATE.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();
    const users = game.getAllUsers();

    console.log(' [ DART: makeMiniGameReadyNoti ] sessionIds ===>> ', sessionIds);
    console.log(' [ DART: makeMiniGameReadyNoti ] users ===>> ', users);

    const type = MESSAGE_TYPE.DART_MINI_GAME_READY_NOTIFICATION;
    const payload = {
      players: users.map((user) => ({
        sessionId: user.sessionId,
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
      })),
    };
    const message = { type, payload };
    logger.info(`[DART: makeMiniGameReadyNoti - message] ===>`, message);
    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  /**
   * * 게임 시작 Notification
   */
  async makeMiniGameStartNoti(game) {
    // * 미니 게임 시작
    logger.info(`[dropGameManager - dropMiniGameStartNoti]`);

    const sessionIds = game.getAllSessionIds();

    const type = MESSAGE_TYPE.DART_MINI_GAME_START_NOTIFICATION;
    const payload = { startTime: Date.now() + 5000 };
    const message = { type, payload };

    logger.info(`[ DART: makeMiniGameStartNoti - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  /**
   * 다트 던지기
   * @param {String} sessionId
   * @param {Object} dartData
   */
  async dartThrow(sessionId, dartData) {
    try {
      const boardId = await redisUtil.getUserLocationField(sessionId, 'board');
      const sessionIds = await redisUtil.getBoardPlayers(boardId);

      // TODO: board => dart로 변경해야함
      // 요청 카운트
      const result = await redisUtil.transaction.boardDartCount(boardId, sessionId, dartData);

      logger.info('[ DART: dartThrow ] result ====>>> ', result);

      return {
        success: true,
        data: {
          sessionIds,
          isOk: result.isOk,
          result: result.diceGameDatas,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ DART : dartThrow ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 같은 게임 세션 ID 조회
   * @param {String} sessionId
   */
  async getSessionIds(sessionId) {
    const boardId = await redisUtil.getUserLocationField(sessionId, 'board');
    const sessionIds = await redisUtil.getBoardPlayers(boardId);
    return sessionIds;
  }
} // end

const dartGameManagerInstance = DartGameManager.getInstance();
Object.freeze(dartGameManagerInstance);
export default dartGameManagerInstance;
