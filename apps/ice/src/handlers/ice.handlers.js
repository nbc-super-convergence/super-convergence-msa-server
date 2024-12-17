import iceGameManager from '../classes/managers/ice.game.manager.js';
import { sessionIds } from '../classes/models/ice.game.class.js';
import { iceConfig } from '../config/config.js';
import { GAME_STATE } from '../constants/states.js';
import { redisUtil } from '../utils/init/redis.js';
import { logger } from '../utils/logger.utils.js';

export const iceGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [iceGameReadyRequestHandler]`);

    const { sessionId } = payload;

    logger.info(`[iceGameReadyRequestHandler - payload]`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`[iceGameReadyRequestHandler - gameId]`, gameId);

    const game = await iceGameManager.getGameBySessionId(gameId);

    logger.info(`[iceGameReadyRequestHandler - game]`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(
        `[iceGameReadyRequestHandler - game is not Found]`,
        iceConfig.FAIL_CODE.GAME_NOT_FOUND,
      );
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(`[iceGameReadyRequestHandler - user]`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(
        `[iceGameReadyRequestHandler - user is not Found]`,
        iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND,
      );
    }

    // ! 유저 준비 = true
    user.gameReady();

    logger.info(`[iceGameReadyRequestHandler - user.isReady]`, user.isReady);

    // * iceGameReadyNotification
    let buffer = await iceGameManager.iceGameReadyNoti(user, game);

    // * iceMiniGameStartNotification
    if (game.isAllReady()) {
      buffer = await iceGameManager.iceMiniGameStartNoti(socket, game);
    }

    socket.write(buffer);
  } catch (error) {
    logger.error(`[iceGameReadyRequestHandler] ===> `, error);
  }
};

export const icePlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [icePlayerSyncRequestHandler]`);

    const { sessionId, position, rotation, state } = payload;

    logger.info(`[icePlayerSyncRequest - payload]`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`[icePlayerSyncRequest - gameId]`, gameId);

    const game = iceGameManager.getGameBySessionId(gameId);

    logger.info(` [icePlayerSyncRequest - game]`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(
        `[icePlayerSyncRequest - game is not Found]`,
        iceConfig.FAIL_CODE.GAME_NOT_FOUND,
      );
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(`[icePlayerSyncRequest - user]`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(
        `[icePlayerSyncRequest - user is not Found]`,
        iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND,
      );
    }

    // * user 사망 확인 && 게임 시작상태 확인
    if (user.isDead() && game.state !== GAME_STATE.START) {
      logger.info(`[icePlayerSyncRequestHandler - user.isDead && Game is not Start]`);
      return;
    }

    // ! 유저 position 변경
    user.updateUserInfos(position, rotation, state);

    logger.info(`[icePlayerSyncRequest - updatedInfosUser]`, user);

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

    logger.info(`[icePlayerDamageRequestHandler - payload]`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`[icePlayerDamageRequestHandler - gameId]`, gameId);

    const game = iceGameManager.getGameBySessionId(gameId);

    logger.info(` [icePlayerDamageRequestHandler - game]`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(
        `[icePlayerDamageRequestHandler - game is not Found]`,
        iceConfig.FAIL_CODE.GAME_NOT_FOUND,
      );
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(` [icePlayerDamageRequestHandler - user]`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(
        `[icePlayerDamageRequestHandler - user is not Found]`,
        iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND,
      );
    }

    if (user.isDead() && game.state !== GAME_STATE.START) {
      logger.info(`[icePlayerDamageRequestHandler - user.isDead && Game is not Start]`);
      return;
    }

    // ! 유저 체력 - 1
    user.damage();

    logger.info(` [icePlayerDamageRequestHandler - user.hp]`, user.hp);

    // * icePlayerDamageNotification
    let buffer = await iceGameManager.icePlayerDamageNoti(user, game);

    // * icePlayerDeathNotification
    if (user.isDead()) {
      logger.info(` [icePlayerDeathNotification - user.hp, user.state]`, user.hp, user.state);
      user.Dead();

      logger.info(` [icePlayerDeathNotification - user.hp, user.state]`, user.hp, user.state);

      // * 사망시 랭킹
      user.rank = game.getAliveUsers().length + 1;

      logger.info(` [icePlayerDeathNotification - user.rank]`, user.rank);

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

    if (!(await redisUtil.getUserLocationField(sessionId, 'dropper'))) {
      logger.info(`[ice Location not found]`);
      return;
    }

    logger.info(`[iceCloseSocketRequestHandler - payload]`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`[iceCloseSocketRequestHandler - gameId]`, gameId);

    const game = iceGameManager.getGameBySessionId(gameId);

    logger.info(`[iceCloseSocketRequestHandler - game]`, game);

    if (!iceGameManager.isValidGame(game.id)) {
      throw new Error(
        `[iceCloseSocketRequestHandler - game is not Found]`,
        iceConfig.FAIL_CODE.GAME_NOT_FOUND,
      );
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(` [iceCloseSocketRequestHandler - user]`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(
        `[iceCloseSocketRequestHandler - user is not Found]`,
        iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND,
      );
    }

    // ! 삭제된 유저
    const deletedUser = game.removeUser(sessionId);

    logger.info(`[iceCloseSocketRequestHandler - deletedUser]`, deletedUser);

    if (game.isValidUser(deletedUser.sessionId)) {
      throw new Error(
        `[iceCloseSocketRequestHandler - user is not deleted]`,
        iceConfig.FAIL_CODE.DELETED_USER_IN_GAME,
      );
    }

    // ! 나간 유저의 게임 위치 삭제
    await redisUtil.deleteUserLocationField(deletedUser.sessionId, 'ice');

    // * 남은 유저 0명일 시 인터벌 종료
    if (game.users.length === 0) {
      game.intervalManager.clearAll();
    }

    if (game.state === GAME_STATE.WAIT && game.isAllReady()) {
      logger.info(`[iceCloseSocketRequestHandler - game]`, game);
      logger.info(`[iceCloseSocketRequestHandler - game.users]`, game.users);
      const buffer = await iceGameManager.iceMiniGameStartNoti(game);

      socket.write(buffer);

      // * 맵 변경, 게임 종료 타이머, 게임 종료 인터벌
      // TODO: 가는 시간까지 포함해서 싱크가 정확하지 않을수도 있음
      game.changeMapTimer(socket);
      game.iceGameTimer(socket);
      game.checkGameOverInterval(socket);

      logger.info(`[iceCloseSocketRequestHandler - game Interval Check]`, game);
    }
  } catch (error) {
    logger.error(`[iceCloseSocketRequestHandler] ===> `, error);
    //TODO: 별도의 에러처리 필요, failCode 전송? success 추가 정도 생각중
  }
};
