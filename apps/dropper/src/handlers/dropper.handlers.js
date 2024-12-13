import { sessionIds } from '../classes/models/dropper.game.class.js';
import dropGameManager from '../classes/managers/dropper.game.manager.js';
import { logger } from '../utils/logger.utils.js';
import { dropConfig } from '../config/config.js';
import { redisUtil } from '../utils/redis.js';
import { GAME_STATE } from '../constants/state.js';

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

    let buffer = await dropGameManager.dropGameReadyNoti(user, game);

    // * 모든 유저 준비 완료
    if (game.isAllReady()) {
      buffer = await dropGameManager.dropMiniGameStartNoti(game);

      //* 인터벌 시작
      game.breakFloorInterval(socket);
      game.checkGameOverInterval(socket);
    }

    socket.write(buffer);
  } catch (error) {
    logger.error(error);
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
      logger.info(`[dropPlayerSyncRequestHandler - User is already exists in ${slot}]`);
      return;
    }

    // * 게임에 slot 업데이트
    // ! 혹시나 다른 유저가 침범하지 못하도록 선 업데이트
    game.updateSlot(user, slot);

    // * 유저 위치 정보 업데이트
    user.updateUserInfos(slot, rotation, state);

    const buffer = await dropGameManager.dropPlayerSyncNoti(user, game);

    socket.write(buffer);
  } catch (error) {
    logger.error(error);
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

    logger.info(` [dropCloseSocketRequestHandler - game] `, game);

    if (!dropGameManager.isValidGame(game.id)) {
      throw new Error(`게임이 존재하지 않음`, dropConfig.FAIL_CODE.GAME_NOT_FOUND);
    }

    const user = game.getUserBySessionId(sessionId);

    logger.info(` [dropCloseSocketRequestHandler - user]`, user);

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

    // * 남은 유저 0명일 시 인터벌 종료
    if (game.users.length === 0) {
      game.intervalManager.clearAll();
    }

    if (game.state === GAME_STATE.WAIT && game.isAllReady()) {
      logger.info(`[현재 게임 상태]`, game);
      logger.info(`[현재 유저의 상태]`, game.users[0]);
      const buffer = await dropGameManager.dropMiniGameStartNoti(game);

      socket.write(buffer);

      game.breakFloorInterval(socket);
      game.checkGameOverInterval(socket);
    }
  } catch (error) {
    logger.error(`[dropCloseSocketRequestHandler] ===> `, error);
    //TODO: 별도의 에러처리 필요, failCode 전송? success 추가 정도 생각중
  }
};
