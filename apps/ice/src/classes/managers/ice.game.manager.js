import { RedisClient, RedisUtil } from '@repo/common/classes';
import iceGame from '../models/ice.game.class.js';
import { REDIS } from '../../constants/env.js';
import { config } from '../../config/config.js';

const redisClient = new RedisClient(REDIS).getClient();
const redisUtil = new RedisUtil(redisClient);

class iceGameManager {
  constructor() {
    if (iceGameManager.instance) {
      return iceGameManager.instance;
    }

    this.games = [];
  }

  static getInstance() {
    if (!iceGameManager.instance) {
      iceGameManager.instance = new iceGameManager();
    }
    return iceGameManager.instance;
  }

  async addGame(sessionId) {
    // ! 방장 아이디로 새로운 게임 생성
    const game = new iceGame(sessionId);

    // ! 방장 아이디로 참여한 보드게임에서 유저들 조회
    const users = await redisUtil.getBoardGameField(sessionId, config.BOARD.PLAYERS);

    game.addUser(users, sessionId);
    this.games.push(game); // 게임 세션에 추가

    console.log(this.games);
  }

  removeGame(id) {
    const index = this.games.findIndex((game) => game.id === id);

    if (index !== -1) {
      const removeGame = this.games.splice(index, 1)[0];
      return removeGame;
    }
  }

  getGameBySessionId(sessionId) {
    return this.games.find((game) => game.id === sessionId);
  }

  getAllGames() {
    return this.games;
  }

  isValidGame(game) {
    return this.games.includes(game) ? true : false;
  }
}

const iceGameManagerInstance = iceGameManager.getInstance();
Object.freeze(iceGameManagerInstance);
export default iceGameManagerInstance;
