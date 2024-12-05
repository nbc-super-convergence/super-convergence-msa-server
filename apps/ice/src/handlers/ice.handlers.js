import iceGameManager from '../classes/managers/ice.game.manager.js';
import { iceConfig } from '../config/config.js';
import { redisUtil } from '../utils/init/redis.js';
import { logger } from '../utils/logger.utils.js';

export const iceGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [iceGameReadyRequestHandler]`);

    const { sessionId } = payload;

    logger.info(`iceGameReadyRequestHandler payload`, payload);

    const gameId = await redisUtil.getUserLocationField(sessionId, 'ice');

    logger.info(`게임 아이디`, gameId);

    const game = await iceGameManager.getGameBySessionId(gameId);

    logger.info(`iceGameReadyRequestHandler 게임`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(`iceGameReadyRequestHandler 유저`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 유저 준비 = true
    user.gameReady();

    logger.info(`유저 준비`, user.isReady);

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

    logger.info(`icePlayerSyncRequest payload`, payload);

    const gameId = await redisUtil.getUserLocationField(sessionId, 'ice');

    logger.info(`게임 아이디`, gameId);

    const game = iceGameManager.getGameBySessionId(gameId);

    logger.info(` icePlayerSyncRequest 게임`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(`icePlayerSyncRequest 유저`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 유저 position 변경
    user.updateUserInfos(position, rotation, state);

    logger.info(`icePlayerSyncRequest 위치 변경`, user);

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

    logger.info(`icePlayerDamageRequestHandler payload`, payload);

    const gameId = await redisUtil.getUserLocationField(sessionId, 'ice');

    logger.info(`게임 아이디`, gameId);

    const game = iceGameManager.getGameBySessionId(gameId);

    logger.info(` icePlayerDamageRequestHandler 게임`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(` icePlayerDamageRequestHandler 유저`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 유저 체력 - 1
    user.damage();

    logger.info(` icePlayerDamageRequestHandler 유저 체력`, user.hp);

    // * icePlayerDamageNotification
    let buffer = await iceGameManager.icePlayerDamageNoti(user, game);

    // * icePlayerDeathNotification
    if (user.isDead()) {
      logger.info(` icePlayerDeathNotification 유저 체력, 상태`, user.hp, user.state);
      user.Dead();

      logger.info(` icePlayerDeathNotification 유저 체력, 상태`, user.hp, user.state);

      // * 사망시 랭킹
      user.rank = game.getAliveUsers().length + 1;

      logger.info(` icePlayerDeathNotification 유저 랭킹`, user.rank);

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

    logger.info(`iceCloseSocketRequestHandler payload`, payload);

    const gameId = await redisUtil.getUserLocationField(sessionId, 'ice');

    logger.info(`게임 아이디`, gameId);

    const game = iceGameManager.getGameBySessionId(gameId);

    logger.info(` iceCloseSocketRequestHandler 게임`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(`게임이 존재하지 않음`, iceConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(` iceCloseSocketRequestHandler 유저`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`유저가 존재하지 않음`, iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 삭제된 유저
    const deletedUser = game.removeUser(sessionId);

    logger.info(`삭제된 유저들`, deletedUser);

    if (game.isValidUser(deletedUser.sessionId)) {
      throw new Error(`유저가 삭제 되지 않음`, iceConfig.FAIL_CODE.DELETED_USER_IN_GAME);
    }

    // ! 나간 유저의 게임 위치 삭제
    await redisUtil.deleteUserLocationField(deletedUser.sessionId, 'ice');
  } catch (error) {
    logger.error(`[iceCloseSocketRequestHandler] ===> `, error);
    //TODO: 별도의 에러처리 필요, failCode 전송? success 추가 정도 생각중
  }
};
