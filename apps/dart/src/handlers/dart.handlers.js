import { MESSAGE_TYPE } from '@repo/common/header';
import { logger } from '../utils/logger.utils.js';
import { serializeForGate } from '@repo/common/utils';
import { sessionIds } from '../classes/models/dart.game.class.js';
import dartGameManager from '../classes/manager/dart.game.manager.class.js';

/**
 * [ 미니게임 - 다트 ] 소개 판넬 - 준비
 * C2S_DartGameReadyRequest
 */
export const dartGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;
    const gameId = sessionIds.get(sessionId);

    const game = dartGameManager.getGameBySessionId(gameId);
    if (!dartGameManager.isValidGame(game.id)) {
      throw new Error(`[ DART : dartGameReadyRequestHandler - ValiGame Error]`, game.id);
    }

    const user = game.getUserBySessionId(sessionId);
    if (!game.isValidUser(user.sessionId)) {
      throw new Error(`[DART : dartGameReadyRequestHandler - ValiUser Error]`, user.sessionId);
    }

    // * 유저 게임 준비
    user.gameReady();

    let buffer = await dartGameManager.makeMiniGameReadyNoti(user, game);

    // * 모든 유저 준비 완료
    if (game.isAllReady()) {
      buffer = await dartGameManager.makeMiniGameStartNoti(socket, game);
    }

    socket.write(buffer);
  } catch (error) {
    logger.error('[ DART: dartGameReadyRequestHandler ] ', error);
  }
};

/**
 * [ 미니게임 - 다트 ] 다트 던지기
 * C2S_DartGameThrowRequest
 */
export const dartGameThrowRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId, distance, angle, location, power } = payload;

    let sessionIds = [sessionId];
    const dartData = {
      distance,
      angle,
      location,
      power,
    };

    // TODO: 변경 예정
    const result = await dartGameManager.dartThrow(sessionId, dartData);

    logger.info('[ DART: dartGameThrowRequestHandler ] result ===>>> ', result);

    // * 전체 NOTIFICATION
    sessionIds = result.data.sessionIds;
    const notificationMessageType = MESSAGE_TYPE.DART_GAME_THROW_NOTIFICATION;
    const notification = {
      result: result.data.rank,
    };
    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);
  } catch (error) {
    logger.error('[ DART: dartGameThrowRequestHandler ] ', error);
  }
};

/**
 * [ 미니게임 - 다트 ] 유저 접속 종료
 *
 */
export const dartCloseSocketRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;
    //
  } catch (error) {
    logger.error('[ DART: dartGameThrowRequestHandler ] ', error);
  }
};
