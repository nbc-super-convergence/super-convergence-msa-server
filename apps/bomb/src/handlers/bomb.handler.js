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
      //bomb 게임을 진행하던 유저가 아님
      return;
    }
    logger.info(` bombCloseSocketRequestHandler 게임`, game);

    const user = game.getUserToSessionId(sessionId);

    if (!user) {
      //bomb 게임을 진행하던 유저가 아님
    }

    logger.info(` bombCloseSocketRequestHandler 유저`, user);

    if (game.bombUser === sessionId) {
      logger.info(` bombCloseSocketRequestHandler 종료 유저가 폭탄 소지 ! `, sessionId);

      const bombUser = game.bombUserSelect();
      game.bombUserChange(bombUser);
      const buffer = await BombGameManager.bombMoveNoti(bombUser, game);
      socket.write(buffer);
      logger.info(`bombCloseSocketRequestHandler 폭탄 소유자 변경`, `${sessionId} =>${bombUser}`);
    }

    game.removeUser(sessionId);
    logger.info(` bombCloseSocketRequestHandler 강제종료 유저 GAME 세션에서 제거 => `, sessionId);

    //게임 준비화면에서 종료한 유저를 제외하고 모두 준비완료 상태일 경우
    if (game.state === GAME_STATE.WAIT && game.isAllReady()) {
      logger.info(
        ` bombCloseSocketRequestHandler 준비화면 -> 강제종료 제외 모두 레디 상태 => `,
        ' 게임 시작 ',
      );

      const buffer = await BombGameManager.bombMiniGameStartNoti(socket, game);
      socket.write(buffer);

      if (game.users.length <= 1) {
        game.bombGameEnd(socket, game.users);
        logger.info(
          ` bombCloseSocketRequestHandler 강제종료 유저로 인해 혼자 시작 => `,
          ' 게임 종료 ',
        );
      }
    }
    await redisUtil.deleteUserLocationField(user.sessionId, 'bomb');
  } catch (error) {
    logger.error(`[bombCloseSocketRequestHandler] ===> `, error);
  }
};
