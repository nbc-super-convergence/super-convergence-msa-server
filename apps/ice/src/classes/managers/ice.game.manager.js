import iceGame from '../models/ice.game.class.js';
import {
  iceGameReadyNotification,
  iceMiniGameReadyNotification,
  iceMiniGameStartNotification,
  icePlayerDamageNotification,
  icePlayerDeathNotification,
  icePlayerSyncNotification,
} from '../../utils/ice.notifications.js';
import { serializeForGate } from '@repo/common/utils';
import { GAME_STATE } from '../../constants/states.js';
import { logger } from '../../utils/logger.utils.js';

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

  async addGame(gameId, users) {
    // ! 방장 아이디로 새로운 게임 생성
    const game = new iceGame(gameId);

    logger.info(`[iceGameManager - users]:`, users);

    logger.info(`게임들`, game);

    await game.addUser(users, gameId);
    this.games.push(game); // 게임 세션에 추가;
  }

  removeGame(id) {
    // * 게임 삭제
    const index = this.games.findIndex((game) => game.id === id);

    if (index !== -1) {
      const removeGame = this.games.splice(index, 1)[0];
      return removeGame;
    }
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

  isValidUserPosition(user, game) {
    // * 위치 검증
    const position = user.getPosition();

    const mapSize = game.getMapSize();
    if (
      position.x > mapSize.max ||
      position.z > mapSize.max ||
      position.x < mapSize.min ||
      position.z < mapSize.min
    ) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: GlobalFailCode용 로직
  // gameValidation(game) {
  //   if (this.games.includes(game)) {
  //     const failCode = iceConfig.FAIL_CODE.GAME_NOT_FOUND;
  //   }

  //   return failCode;
  // }

  async iceMiniGameReadyNoti(game) {
    // * 게임 상태 변경
    logger.info(`[iceGameManager - iceMiniGameReadyNoti]`);

    game.setGameState(GAME_STATE.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();

    const users = game.getAllUser();

    const message = iceMiniGameReadyNotification(users);

    logger.info(`[iceMiniGameReadyNoti] ===>`, message);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async iceGameReadyNoti(user, game) {
    // * 플레이어 준비
    logger.info(`[iceGameManager - iceGameReadyNoti]`);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = iceGameReadyNotification(user.sessionId);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async iceMiniGameStartNoti(socket, game) {
    // * 미니 게임 시작
    logger.info(`[iceGameManager - iceMiniGameStartNoti]`);

    const sessionIds = game.getAllSessionIds();

    const message = iceMiniGameStartNotification();

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    // * 맵 변경, 게임 종료 타이머, 게임 종료 인터벌
    // TODO: 가는 시간까지 포함해서 싱크가 정확하지 않을수도 있음
    game.changeMapTimer(socket);
    game.iceGameTimer(socket);
    game.checkGameOverInterval(socket);

    return buffer;
  }

  async icePlayerSyncNoti(user, game) {
    //* 유저 위치 정보 업데이트
    logger.info(`[iceGameManager - icePlayerSyncNoti]`);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerSyncNotification(user);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async icePlayerDamageNoti(user, game) {
    // * 플레이어 데미지
    logger.info(`[iceGameManager - icePlayerDamageNoti]`);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerDamageNotification(user.sessionId);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  async icePlayerDeathNoti(user, game) {
    // * 플레이어 사망
    logger.info(`[iceGameManager - icePlayerDeathNoti]`);

    // TODO: 자신에게도 보내줘야하는지 확인하기
    const sessionIds = game.getAllSessionIds(user.sessionId);

    const message = icePlayerDeathNotification(user);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }
}

const iceGameManagerInstance = iceGameManager.getInstance();
Object.freeze(iceGameManagerInstance);
export default iceGameManagerInstance;
