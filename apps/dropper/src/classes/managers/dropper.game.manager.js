import { serializeForGate } from '@repo/common/utils';
import { logger } from '../../utils/logger.utils.js';
import dropperGame from '../models/dropper.game.class.js';
import { GAME_STATE } from '../../constants/state.js';
import {
  dropGameReadyNotification,
  dropMiniGameStartNotification,
  dropMiniGameReadyNotification,
  dropPlayerDeathNotification,
  dropPlayerSyncNotification,
} from '../../utils/dropper.notificaion.js';

class dropperGameManager {
  constructor() {
    if (dropperGameManager.instance) {
      return dropperGameManager.instance;
    }

    this.games = [];
  }

  static getInstance() {
    if (!dropperGameManager.instance) {
      dropperGameManager.instance = new dropperGameManager();
    }
    return dropperGameManager.instance;
  }

  async addGame(gameId, users) {
    const game = new dropperGame(gameId);

    logger.info(`[dropperGameManager - users]:`, users);

    logger.info(`[dropperGameManager - game]`, game);

    await game.addUser(users, gameId);
    this.games.push(game); // 게임 세션에 추가
  }

  getGameBySessionId(sessionId) {
    // * 게임 조회
    return this.games.find((game) => game.id === sessionId);
  }

  getAllGames() {
    // * 모든 게임 조회
    return this.games;
  }

  isValidGame(gameId) {
    // * 게임 검증
    return this.games.find((game) => game.id === gameId) ? true : false;
  }

  async dropMiniGameReadyNoti(game) {
    // * 게임 상태 변경
    logger.info(`[dropperGameManager - dropMiniGameReadyNoti]`);

    game.setGameState(GAME_STATE.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();

    const users = game.getAllUsers();

    const message = dropMiniGameReadyNotification(users);

    logger.info(`[dropMiniGameReadyNoti - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async dropGameReadyNoti(user, game) {
    // * 플레이어 준비
    logger.info(`[dropperGameManager - dropGameReadyNoti]`);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = dropGameReadyNotification(user.sessionId);

    logger.info(`[dropGameReadyNoti - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async dropMiniGameStartNoti(game) {
    // * 미니 게임 시작
    logger.info(`[dropGameManager - dropMiniGameStartNoti]`);

    const sessionIds = game.getAllSessionIds();

    const message = dropMiniGameStartNotification();

    logger.info(`[dropMiniGameStartNoti - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    //TODO: 유저 이동 타임 - 바닥 깨짐 - 떨어지는 시간으로 인터벌 필요

    return buffer;
  }

  async dropPlayerSyncNoti(user, game) {
    //* 유저 위치 정보 업데이트
    logger.info(`[dropGameManager - dropPlayerSyncNoti]`);

    const sessionIds = game.getAllSessionIds(user.sessionId);

    const message = dropPlayerSyncNotification(user);

    logger.info(`[dropPlayerSyncNoti - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async dropPlayerDeathNoti(user, game) {
    // * 플레이어 사망
    logger.info(`[dropGameManager - dropPlayerDeathNoti]`);

    // TODO: 자신에게도 보내줘야하는지 확인하기
    const sessionIds = game.getAllSessionIds(user.sessionId);

    const message = dropPlayerDeathNotification(user);

    logger.info(`[dropPlayerDeathNoti - message] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async dropLevelStartNoti() {}
  async dropLevelEndNoti() {}
  async dropGameOverNoti() {}
}

const dropperGameManagerInstance = dropperGameManager.getInstance();
Object.freeze(dropperGameManagerInstance);
export default dropperGameManagerInstance;
