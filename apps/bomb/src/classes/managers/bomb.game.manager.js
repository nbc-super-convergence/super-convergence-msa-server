import { logger } from '@repo/common/config';
import BombGame from '../models/bomb.game.class.js';
import { serializeForGate } from '@repo/common/utils';
import {
  bombGameReadyNotification,
  bombMiniGameReadyNotification,
  bombMiniGameStartNotification,
  bombMoveNotification,
  bombPlayerSyncNotification,
} from '../../utils/bomb.notifications.js';
import { GAME_STATE } from '../../constants/game.js';

class BombGameManager {
  constructor() {
    if (BombGameManager.instance) {
      return BombGameManager.instance;
    }

    this.games = [];
  }

  static getInstance() {
    if (!BombGameManager.instance) {
      BombGameManager.instance = new BombGameManager();
    }
    return BombGameManager.instance;
  }

  // 새로운 게임 시작
  async addGame(boardId, users) {
    const game = new BombGame(boardId);

    logger.info(`[bombGameManager - users]:`, users);

    logger.info(`게임들`, game);

    await game.addUser(boardId, users);
    this.games.push(game); // 게임 세션에 추가;
  }

  getGameBySessionId(sessionId) {
    // * 게임 조회
    return this.games.find((game) => game.id === sessionId);
  }

  // 시작 준비 알림
  async bombMiniGameReadyNoti(game) {
    logger.info(`[bombGameManager - bombMiniGameReadyNoti]`);

    game.setGameState(GAME_STATE.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();

    const users = game.getAllUser();

    // 여기서 첫 폭탄유저 선정
    const bombUser = game.bombUserSelect();
    game.bombUserChange(bombUser);
    console.log('폭탄 유저 선정', bombUser);
    const message = bombMiniGameReadyNotification(users, bombUser);

    logger.info(`[bombMiniGameReadyNoti] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async bombGameReadyNoti(user, game) {
    // * 플레이어 준비
    logger.info(`[bombGameManager - bombGameReadyNoti]`);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = bombGameReadyNotification(user.sessionId);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async bombMiniGameStartNoti(socket, game) {
    // * 미니 게임 시작
    logger.info(`[bombGameManager - bombMiniGameStartNoti]`);

    const sessionIds = game.getAllSessionIds();

    const message = bombMiniGameStartNotification();

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    // 여기서 폭탄 타이머 시작
    game.bombTimerStart(socket);

    return buffer;
  }

  async bombPlayerSyncNoti(user, game) {
    //* 유저 위치 정보 업데이트
    logger.info(`[bombGameManager - bombPlayerSyncNoti]`);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = bombPlayerSyncNotification(user);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async bombMoveNoti(sessionId, game) {
    //* 폭탄 보유자 이동
    logger.info(`[bombGameManager - bombMoveNoti]`);

    const sessionIds = game.getAllSessionIds(sessionId);

    const message = bombMoveNotification(sessionId);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async resetGame(gameId) {
    const game = this.games.filter((game) => game.id !== gameId);
    this.games = game;
  }
}

const bombGameManagerInstance = BombGameManager.getInstance();
Object.freeze(bombGameManagerInstance);
export default bombGameManagerInstance;
