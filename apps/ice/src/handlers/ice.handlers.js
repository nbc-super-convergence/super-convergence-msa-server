import iceGameManager from '../classes/managers/ice.game.manager.js';
import { iceConfig } from '../config/config.js';
import { redisUtil } from '../utils/init/redis.js';
import { logger } from '../utils/logger.utils.js';

export const iceGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [iceGameReadyRequestHandler]`);

    const { sessionId } = payload;

    const gameId = await redisUtil.getUserLocationField(sessionId, 'ice');

    const game = await iceGameManager.getGameBySessionId(gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 유저 준비 = true
    user.gameReady();

    // * iceGameReadyNotification
    let buffer = await iceGameManager.iceGameReadyNoti(user, game);

    // * iceMiniGameStartNotification
    if (game.isAllReady()) {
      buffer = await iceGameManager.iceMiniGameStartNoti(socket, game);
    }

    // TODO: 마지막 남은 유저가 준비했을 때 굳이 2개를 보내야 할까?
    socket.write(buffer);
  } catch (error) {
    logger.error(`[iceGameReadyRequestHandler] ===> `, error);
  }
};

export const icePlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [icePlayerSyncRequestHandler]`);

    const { sessionId, position, rotation, state } = payload;

    const gameId = redisUtil.getUserLocationField(sessionId, 'ice');

    const game = iceGameManager.getGameBySessionId(gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 유저 position 변경
    user.updateUserInfos(position, rotation, state);

    // * icePlayerSyncNotification
    const buffer = await iceGameManager.icePlayerSyncNoti(user, game);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[icePlayerSyncRequestHandler] ===> `, error);
  }
};

export const icePlayerDamageRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [icePlayerDamageRequestHandler]`);

    const { sessionId } = payload;

    const gameId = redisUtil.getUserLocationField(sessionId, 'ice');

    const game = iceGameManager.getGameBySessionId(gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    //* 위치 검증
    if (!iceGameManager.isValidUserPosition(user, game)) {
      throw new Error(`데미지를 받을 위치가 아닙니다.`, iceConfig.FAIL_CODE.INVALID_USER_POSITION);
    }

    // ! 유저 체력 - 1
    user.damage();

    // * icePlayerDamageNotification
    let buffer = await iceGameManager.icePlayerDamageNoti(user, game);

    // * icePlayerDeathNotification
    if (user.isDead()) {
      user.Dead();

      // * 사망시 랭킹
      user.rank = game.getAliveUser().length + 1;

      // TODO: 사망시 데미지를 받은 noti를 같이 보내줘야하는지
      buffer = await iceGameManager.icePlayerDeathNoti(user, game);
    }

    socket.write(buffer);
  } catch (error) {
    logger.error(`[icePlayerDamageRequestHandler] ===> `, error);
  }
};

export const iceCloseSocketRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [iceCloseSocketRequestHandler]`);

    const { sessionId } = payload;

    const gameId = redisUtil.getUserLocationField(sessionId, 'ice');

    const game = iceGameManager.getGameBySessionId(gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 삭제된 유저
    const deletedUser = game.removeUser(sessionId);

    if (game.isValidUser(deletedUser)) {
      throw new Error(`유저가 삭제 되지 않음`, iceConfig.FAIL_CODE.DELETED_USER_IN_GAME);
    }

    // ! 나간 유저의 게임 위치 삭제
    await redisUtil.deleteUserLocationField(deletedUser.sessionId, 'ice');
  } catch (error) {
    logger.error(`[iceCloseSocketRequestHandler] ===> `, error);
    //TODO: 별도의 에러처리 필요, failCode 전송? success 추가 정도 생각중
  }
};
