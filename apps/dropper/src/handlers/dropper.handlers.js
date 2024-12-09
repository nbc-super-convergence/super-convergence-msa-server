import { sessionIds } from '../classes/models/dropper.game.class.js';
import dropGameManager from '../classes/managers/dropper.game.manager.js';
import { logger } from '../../utils/logger.utils.js';

export const dropGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;

    const gameId = sessionIds.get(sessionId);

    const game = dropGameManager.getGameBySessionId(gameId);

    if (!dropGameManager.isValidGame(game.id)) {
      throw new Error(`[dropGameReadyRequestHandler - ValiGame Error]`);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`[dropGameReadyRequestHandler - ValiUser Error]`);
    }

    // * 유저 게임 준비
    user.gameReady();

    let buffer = dropGameManager.dropGameReadyNoti(user, game);

    // * 모든 유저 준비 완료
    if (game.isAllReady()) {
      buffer = dropGameManager.dropMiniGameStartNoti(socket, game);

      //* 인터벌 시작
      game.breakFloorInterval(socket);
    }

    socket.write(buffer);
  } catch (error) {
    logger.info(error);
  }
};

export const dropPlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId, slot, rotation, state } = payload;

    // ! 1. 유저, 게임 검증
    const gameId = sessionIds.get(sessionId);

    const game = dropGameManager.getGameBySessionId(gameId);

    if (!dropGameManager.isValidGame(game.id)) {
      throw new Error(`[dropPlayerSyncRequestHandler - ValiGame Error]`);
    }

    const user = game.getUserBySessionId(sessionId);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`[dropPlayerSyncRequestHandler - ValiUser Error]`);
    }

    // ! 2. 유저가 사망했는지 검증
    if (user.isDead()) {
      logger.info(`[dropPlayerSyncRequestHandler - User is DIE]`);
      return;
    }

    // ! 3. slot에 다른 유저 있는지 검증
    if (game.checkUserInSlot(slot)) {
      logger.info(`[dropPlayerSyncRequestHandler - User is already exists in slot]`);
      return;
    }

    // * 게임에 slot 업데이트
    game.updateSlot(slot);

    // * 유저 위치 정보 업데이트
    user.updateUserInfos(slot, rotation, state);

    const buffer = dropGameManager.dropPlayerSyncNoti(user, game);

    socket.write(buffer);
  } catch (error) {
    logger.info(error);
  }
};
