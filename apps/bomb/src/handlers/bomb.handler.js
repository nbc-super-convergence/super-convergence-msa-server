import BombGameManager from '../classes/managers/bomb.game.manager.js';
import { sessionIds } from '../classes/models/bomb.game.class.js';
import { bombConfig } from '../config/config.js';
import { logger } from '../utils/logger.utils.js';

export const bombGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;
    const gameId = sessionIds.get(sessionId);

    const game = await BombGameManager.getGameBySessionId(gameId);

    if (!game) {
      throw new Error(`게임이 존재하지 않음`, bombConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserToSessionId(sessionId);

    if (!user) {
      throw new Error(`유저가 존재하지 않음`, bombConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    user.gameReady();

    let buffer = await BombGameManager.bombGameReadyNoti(user, game);
    if (game.isAllReady()) {
      buffer = await BombGameManager.bombMiniGameStartNoti(socket, game);
    }
    socket.write(buffer);
  } catch (error) {
    logger.error(`[bombGameReadyRequestHandler] ===> `, error);
  }
};

export const bombPlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [bombPlayerSyncRequestHandler]`);

    const { sessionId, position, rotation, state } = payload;

    logger.info(`bombPlayerSyncRequest payload`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`게임 아이디`, gameId);

    const game = await BombGameManager.getGameBySessionId(gameId);

    logger.info(` bombPlayerSyncRequest 게임`, game);

    if (!game) {
      throw new Error(`게임이 존재하지 않음`, bombConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserToSessionId(sessionId);

    logger.info(`icePlayerSyncRequest 유저`, user);

    if (!user) {
      throw new Error(`유저가 존재하지 않음`, bombConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    if (user.isDead()) {
      logger.info(`bombPlayerDamageRequestHandler 유저 죽어있음`, user.sessionId);
      return;
    }

    // ! 유저 position 변경
    user.updateUserInfos(position, rotation, state);

    logger.info(`bombPlayerSyncRequest 위치 변경`, user);

    // * bombPlayerSyncNotification
    const buffer = await BombGameManager.bombPlayerSyncNoti(user, game);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[bombPlayerSyncRequestHandler] ===> `, error);
  }
};

export const bombMoveRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [bombMoveRequestHandler]`);

    const { sessionId } = payload;

    logger.info(`bombMoveRequestHandler payload`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`게임 아이디`, gameId);

    const game = await BombGameManager.getGameBySessionId(gameId);

    logger.info(` bombMoveRequestHandler 게임`, game);

    if (!game) {
      throw new Error(`게임이 존재하지 않음`, bombConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserToSessionId(sessionId);

    if (!user) {
      throw new Error(`유저가 존재하지 않음`, bombConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    logger.info(`bombMoveRequestHandler 폭탄 소유자 변경`, `${game.bombUser} =>${sessionId}`);
    game.bombUserChange(sessionId);

    const buffer = await BombGameManager.bombMoveNoti(sessionId, game);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[bombMoveRequestHandler] ===> `, error);
  }
};
