import { RedisClient, RedisUtil } from '@repo/common/classes';
import iceGame from '../models/ice.game.class.js';
import { REDIS } from '../../constants/env.js';
import { iceConfig } from '../../config/config.js';
import {
  iceGameReadyNotification,
  iceMiniGameReadyNotification,
  iceMiniGameStartNotification,
  icePlayerDamageNotification,
  icePlayerDeathNotification,
  icePlayerSyncNotification,
} from '../../utils/ice.notifications.js';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { serializeForGate } from '@repo/common/utils';
import { GAME_STATE } from '../../constants/states.js';

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

  async addGame(gameId, users) {
    // ! 방장 아이디로 새로운 게임 생성
    const game = new iceGame(gameId);

    console.log(`유저입니다`, users);

    // TODO: 현재 여기서 걸려서 유저 생성 후 넘어가야하는데 그러지 않고 바로 넘어감
    await game.addUser(users, gameId);
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

  isValidUserPosition(user, game) {
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
    console.log(`[iceGameManager - iceMiniGameReadyNoti]`);

    game.setGameState(GAME_STATE.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();

    console.log(`게임입니다`, game);
    console.log(`세션 아이디들`, sessionIds);
    const users = game.getAllUser();

    const message = iceMiniGameReadyNotification(users);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  async iceGameReadyNoti(user, game) {
    // * 플레이어 준비
    console.log(`[iceGameManager - iceGameReadyNoti]`);

    user.gameReady();

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = iceGameReadyNotification(user.sessionId);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  async iceMiniGameStartNoti(socket, game) {
    console.log(`모든 유저 준비 완료`);

    const sessionIds = game.getAllSessionIds();

    const message = iceMiniGameStartNotification();

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    // * 맵 변경, 게임 종료 타이머, 게임 종료 인터벌
    game.changeMapTimer(socket);
    game.iceGameTimer(socket);
    game.checkGameOverInterval(socket);

    return buffer;
  }

  icePlayerSyncNoti(user, game, payload) {
    //* 유저 위치 정보 업데이트
    console.log(`[iceGameManager - icePlayerSyncNoti]`);

    user.updateUserInfos(payload.position, payload.rotation, payload.state);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerSyncNotification(user);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  icePlayerDamageNoti(user, game) {
    // * 플레이어에 데미지
    console.log(`[iceGameManager - icePlayerDamageNoti]`);

    user.damage();

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerDamageNotification(user.sessionId);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, payloadType, sessionIds);

    return buffer;
  }

  icePlayerDeathNoti(user, game) {
    // * 플레이어 사망
    console.log(`[iceGameManager - icePlayerDeathNoti]`);

    user.Dead();

    // * 사망시 랭킹
    user.rank = game.getAliveUser().length + 1;

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerDeathNotification(user);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  icePlayerExitNoti() {
    // * 플레이어 탈주
    console.log(`[iceGameManager - icePlayerExitNoti]`);
  }
}

const iceGameManagerInstance = iceGameManager.getInstance();
Object.freeze(iceGameManagerInstance);
export default iceGameManagerInstance;
