import { logger } from '../../../utils/logger.utils.js';
import dropperGame from '../models/dropper.game.class.js';

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

  async addUser(gameId, users) {
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
}

const dropperGameManagerInstance = dropperGameManager.getInstance();
Object.freeze(dropperGameManagerInstance);
export default dropperGameManagerInstance;
