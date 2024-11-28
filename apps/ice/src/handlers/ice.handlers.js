import iceGameManager from '../classes/managers/ice.game.manager.js';
import iceUserManager from '../classes/managers/ice.user.manager.js';
import { logger } from '@repo/common/config';

export const iceMiniGameStartRequestHandler = async ({ socket, payload }) => {
  try {
    // ! 방장의 세션아이디
    const { sessionId } = payload;

    const game = iceGameManager.getGameBySessionId(sessionId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    //* iceMiniGameReadyNotification
    const buffer = await iceGameManager.iceMiniGameReadyNoti(game);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[iceMiniGameStartRequestHandler]====> `, error);
  }
};

export const iceGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;

    const user = iceUserManager.getUserBySessionId(sessionId);

    if (!iceUserManager.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    const game = iceGameManager.getGameBySessionId(user.gameId);

    // * iceGameReadyNotification
    const readyBuffer = await iceGameManager.iceGameReadyNoti(user, game);

    // * iceMiniGameStartNotification
    const startBuffer = await iceGameManager.iceMiniGameStartNoti(socket, game);

    socket.write(startBuffer ? startBuffer : readyBuffer);
  } catch (error) {
    logger.error(`[iceGameReadyRequestHandler] ===> `, error);
  }
};

export const icePlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    const user = iceUserManager.getUserBySessionId(payload.sessionId);

    const game = iceGameManager.getGameBySessionId(user.gameId);

    // * icePlayerSyncNotification
    const buffer = await iceUserManager.icePlayerSyncNoti(user, game, payload);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[icePlayerSyncRequestHandler] ===> `, error);
  }
};

export const icePlayerDamageRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;

    const user = iceUserManager.getUserBySessionId(sessionId);

    const game = iceGameManager.getGameBySessionId(user.gameId);

    // * icePlayerDamageNotification
    const damageBuffer = await iceUserManager.icePlayerDamageNoti(user, game);

    // * icePlayerDeathNotification
    const deathBuffer = await iceUserManager.icePlayerDeathNoti(user, game);

    socket.write(deathBuffer ? deathBuffer : damageBuffer);

    // * iceGameOverNotification
    await iceGameManager.iceGameOver(socket, game);
  } catch (error) {
    logger.error('[icePlayerDamageRequestHandler] ===> ', error);
  }
};
