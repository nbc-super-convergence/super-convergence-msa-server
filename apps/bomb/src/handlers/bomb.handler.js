import bombGameManagerInstance from '../classes/managers/bomb.game.manager.js';
import BombGameManager from '../classes/managers/bomb.game.manager.js';
import { sessionIds } from '../classes/models/bomb.game.class.js';
import { bombConfig } from '../config/config.js';
import { GAME_STATE } from '../constants/game.js';
import { USER_STATE } from '../constants/user.js';
import { logger } from '../utils/logger.utils.js';
import { redisUtil } from '../utils/redis.init.js';

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

    // 특수조건=  혼자 게임을 시작한 경우 게임 종료
    if (game.state === GAME_STATE.START && game.users.length <= 1) {
      game.bombGameEnd(socket, game.users);
    }
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

    logger.info(`bombPlayerSyncRequest 유저`, user);

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

    const { sessionId, bombUserId } = payload;

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

    if (user.state === USER_STATE.DIE) {
      logger.info(`bombMoveRequestHandler`, '사망한 대상에게 폭탄 넘기기 시도');
      return;
    }

    if (game.bombUser !== bombUserId) {
      logger.info(`bombMoveRequestHandler`, '폭탄이 없는 사람이 넘기기 시도');
      return;
    }
    logger.info(`bombMoveRequestHandler 폭탄 소유자 변경`, `${game.bombUser} =>${sessionId}`);
    game.bombUserChange(sessionId);

    const buffer = await BombGameManager.bombMoveNoti(sessionId, game);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[bombMoveRequestHandler] ===> `, error);
  }
};

export const bombCloseSocketRequestHandler = async ({ socket, payload }) => {
  try {
    logger.info(`Start [bombCloseSocketRequestHandler]`);

    const { sessionId } = payload;

    logger.info(`bombCloseSocketRequestHandler payload`, payload);

    const gameId = sessionIds.get(sessionId);

    logger.info(`bombCloseSocketRequestHandler 종료 유저 gameId`, gameId);

    const game = bombGameManagerInstance.getGameBySessionId(gameId);

    if (!game) {
      //보드를 시작하지 않은 유저
      return;
    }
    logger.info(` bombCloseSocketRequestHandler 게임`, game);

    const user = game.getUserToSessionId(sessionId);

    if (!user) {
      //보드를 시작하지 않은 유저
    }

    logger.info(` bombCloseSocketRequestHandler 유저`, user);
    game.removeUser(sessionId);
    logger.info(` bombCloseSocketRequestHandler 강제종료 유저 GAME 세션에서 제거 => `, sessionId);

    if (game.bombUser === sessionId) {
      // 종료 유저가 폭탄 소지중일 경우
      logger.info(` bombCloseSocketRequestHandler 종료 유저가 폭탄 소지중 `, sessionId);
      const bombUser = game.bombUserSelect();
      game.bombUserChange(bombUser);
      const buffer = await BombGameManager.bombMoveNoti(bombUser, game);
      socket.write(buffer);
      logger.info(`bombCloseSocketRequestHandler 폭탄 소유자 변경`, `${sessionId} =>${bombUser}`);
    }

    if (game.state === GAME_STATE.WAIT && game.isAllReady()) {
      //게임 준비화면에서 종료한 유저를 제외하고 모두 준비완료 상태일 경우
      const buffer = await BombGameManager.bombMiniGameStartNoti(socket, game);
      socket.write(buffer);
      logger.info(
        ` bombCloseSocketRequestHandler 준비화면 -> 강제종료 제외 모두 레디 상태 => `,
        ' 게임 시작 ',
      );
    }

    // 혼자인 경우 게임 종료
    if (game.state === GAME_STATE.START && game.getAliveUsers().length <= 1) {
      game.bombGameEnd(socket, game.users);
    }

    await redisUtil.deleteUserLocationField(sessionId, 'bomb');
  } catch (error) {
    logger.error(`[bombCloseSocketRequestHandler] ===> `, error);
  }
};
