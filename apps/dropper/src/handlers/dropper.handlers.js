import { sessionIds } from '../classes/models/dropper.game.class.js';
import dropGameManager from '../classes/managers/dropper.game.manager.js';
import { logger } from '../../utils/logger.utils.js';
import { dropConfig } from '../config/config.js';
import { redisUtil } from '../../utils/redis.js';

export const dropGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;

    const gameId = sessionIds.get(sessionId);

    // * 게임 아이디 검증
    if (!gameId) {
      throw new Error(`[dropGameReadyRequestHandler - don't exist GameId]`);
    }

    const game = dropGameManager.getGameBySessionId(gameId);

    // * 게임 검증
    if (!dropGameManager.isValidGame(game.id)) {
      throw new Error(`[dropGameReadyRequestHandler - ValiGame Error]`);
    }

    const user = game.getUserBySessionId(sessionId);

    // * 유저 검증
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
      game.checkGameOverInterval(socket);
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

    // * 게임 아이디 검증
    if (!gameId) {
      throw new Error(`[dropGameReadyRequestHandler - don't exist GameId]`);
    }

    const game = dropGameManager.getGameBySessionId(gameId);

    // * 게임 검증
    if (!dropGameManager.isValidGame(game.id)) {
      throw new Error(`[dropPlayerSyncRequestHandler - ValiGame Error]`);
    }

    const user = game.getUserBySessionId(sessionId);

    // * 유저 검증
    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`[dropPlayerSyncRequestHandler - ValiUser Error]`);
    }

    // ! 유저가 사망 검증
    if (user.isDead()) {
      logger.info(`[dropPlayerSyncRequestHandler - User is DIE]`);
      return;
    }

    // !  slot에 다른 유저 존재 유무 검증
    if (game.checkUserInSlot(slot)) {
      logger.info(`[dropPlayerSyncRequestHandler - User is already exists in slot]`);
      return;
    }

    // * 게임에 slot 업데이트
    // ! 혹시나 다른 유저가 침범하지 못하도록 선 업데이트
    game.updateSlot(slot);

    // * 유저 위치 정보 업데이트
    user.updateUserInfos(slot, rotation, state);

    const buffer = dropGameManager.dropPlayerSyncNoti(user, game);

    socket.write(buffer);
  } catch (error) {
    logger.info(error);
  }
};

export const dropCloseSocketRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [dropCloseSocketRequestHandler]`);

    const { sessionId } = payload;

    logger.info(`[dropCloseSocketRequestHandler - payload]`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`게임 아이디`, gameId);

    const game = dropGameManager.getGameBySessionId(gameId);

    logger.info(` [iceCloseSocketRequestHandler - game] `, game);

    if (!dropGameManager.isValidGame(game.id)) {
      throw new Error(`게임이 존재하지 않음`, dropConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(` [iceCloseSocketRequestHandler - user]`, user);

    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`유저가 존재하지 않음`, dropConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND);
    }

    // ! 삭제된 유저
    const deletedUser = game.removeUser(sessionId);

    logger.info(`[dropCloseSocketRequestHandler - deletedUser]`, deletedUser);

    if (game.isValidUser(deletedUser.sessionId)) {
      throw new Error(`유저가 삭제 되지 않음`, dropConfig.FAIL_CODE.DELETED_USER_IN_GAME);
    }

    // ! 나간 유저의 게임 위치 삭제
    await redisUtil.deleteUserLocationField(deletedUser.sessionId, 'dropper');
  } catch (error) {
    logger.error(`[iceCloseSocketRequestHandler] ===> `, error);
    //TODO: 별도의 에러처리 필요, failCode 전송? success 추가 정도 생각중
  }
};
