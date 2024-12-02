import iceGameManager from '../classes/managers/ice.game.manager.js';
import { redisUtil } from '../utils/init/redis.js';

export const iceGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    console.log(`Start [iceGameReadyRequestHandler]`);

    const { sessionId } = payload;

    console.log(`세션아이디`, sessionId);
    const gameId = await redisUtil.getUserLocationField(sessionId, 'ice');

    console.log(`게임 아이디`, gameId);
    const game = await iceGameManager.getGameBySessionId(gameId);

    console.log(`게임 확인`, game);
    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    const user = await game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    // * iceGameReadyNotification
    let buffer = await iceGameManager.iceGameReadyNoti(user, game);

    // * iceMiniGameStartNotification
    if (game.isAllReady()) {
      buffer = await iceGameManager.iceMiniGameStartNoti(socket, game);
    }

    // TODO: 마지막 남은 유저가 준비했을 때 굳이 2개를 보내야 할까?
    socket.write(buffer);
  } catch (error) {
    console.error(`[iceGameReadyRequestHandler] ===> `, error);
  }
};

export const icePlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    console.log(`Start [icePlayerSyncRequestHandler]`);

    const { sessionId } = payload;

    const gameId = redisUtil.getUserLocationField(sessionId, 'ice');

    const game = iceGameManager.getGameBySessionId(gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    // * icePlayerSyncNotification
    const buffer = await iceGameManager.icePlayerSyncNoti(user, game, payload);

    socket.write(buffer);
  } catch (error) {
    console.error(`[icePlayerSyncRequestHandler] ===> `, error);
  }
};

export const icePlayerDamageRequestHandler = async ({ socket, payload }) => {
  try {
    console.log(`Start [icePlayerDamageRequestHandler]`);

    const { sessionId } = payload;

    const gameId = redisUtil.getUserLocationField(sessionId, 'ice');

    const game = iceGameManager.getGameBySessionId(gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    //* 위치 검증
    if (!iceGameManager.isValidUserPosition(user, game)) {
      throw new Error(`데미지를 받을 위치가 아닙니다.`);
    }

    // * icePlayerDamageNotification
    let buffer = await iceGameManager.icePlayerDamageNoti(user, game);

    // * icePlayerDeathNotification
    if (user.isDead()) {
      buffer = await iceGameManager.icePlayerDeathNoti(user, game);
    }

    socket.write(buffer);
  } catch (error) {
    console.error('[icePlayerDamageRequestHandler] ===> ', error);
  }
};
