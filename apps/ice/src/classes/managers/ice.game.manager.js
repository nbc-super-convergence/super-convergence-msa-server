import { RedisClient, RedisUtil } from '@repo/common/classes';
import iceGame from '../models/ice.game.class.js';
import { REDIS } from '../../constants/env.js';
import { config } from '../../config/config.js';
import {
  iceGameReadyNotification,
  iceMiniGameReadyNotification,
  iceMiniGameStartNotification,
} from '../../utils/ice.notifications.js';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { serializeForGate } from '@repo/common/utils';

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

    // TODO: 이 부분 보드게임에서 수정할 시 수정 필요
    const users = await redisUtil.getBoardPlayersBySessionId(sessionId);

    game.addUser(users, sessionId);
    this.games.push(game); // 게임 세션에 추가;

    console.log(`현재 게임들`, this.games);
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

  // TODO: GlobalFailCode용 로직
  gameValidation(game) {
    if (this.games.includes(game)) {
      const failCode = config.FAIL_CODE.GAME_NOT_FOUND;
    }

    return failCode;
  }

  async iceMiniGameReadyNoti(game) {
    // * 게임 상태 변경
    game.setGameState(gameState.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();

    const users = game.getAllUser();

    const message = iceMiniGameReadyNotification(users);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  async iceGameReadyNoti(user, game) {
    // * 플레이어 준비
    user.player.gameReady();

    const sessionIds = game.getOtherSessionIds(user.id);

    const message = iceGameReadyNotification(user.sessionId);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  async iceMiniGameStartNoti(socket, game) {
    if (game.isAllReady()) {
      console.log(`모든 유저 준비 완료`);

      const sessionIds = game.getAllSessionIds();

      const message = iceMiniGameStartNotification();

      const payloadType = getPayloadNameByMessageType(message.type);

      const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

      // * 맵 변경, 게임 종료 타이머
      game.changeMap(socket);
      game.iceGameTimer(socket);

      return buffer;
    }
    return;
  }

  async iceGameOver(socket, game) {
    if (game.isOneAlive()) {
      const user = game.getAliveUsers()[0];

      user.player.rank = 1;

      game.handleGameEnd(socket);
    }
  }
}

const iceGameManagerInstance = iceGameManager.getInstance();
Object.freeze(iceGameManagerInstance);
export default iceGameManagerInstance;
