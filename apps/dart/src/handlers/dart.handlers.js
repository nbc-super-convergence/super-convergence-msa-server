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

    const result = await dartGameManager.makeDartGameReadyNoti(sessionId);

    // * 모든 유저 준비 완료
    logger.info(
      '[ DART: dartGameReadyRequestHandler ] isAllReady, result.sessionIds ===>>> ',
      result.isAllReady,
      result.sessionIds,
    );
    if (result.isAllReady) {
      result.buffer = await dartGameManager.makeMiniGameStartNoti(result.sessionIds);
    }

    socket.write(result.buffer);
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
      sessionId,
      distance,
      angle,
      location,
      power,
    };

    // TODO: 변경 예정, 일단은 안씀
    // const result = await dartGameManager.dartThrow(sessionId, dartData);

    // logger.info('[ DART: dartGameThrowRequestHandler ] result ===>>> ', result);
    sessionIds = await dartGameManager.getSessionIds(sessionId);

    // * 본인 제외  NOTIFICATION
    sessionIds = sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.DART_GAME_THROW_NOTIFICATION;
    const notification = {
      result: dartData,
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
 * 다트판 싱크 요청
 * DART_PANNEL_SYNC_REQUEST
 *
 * 알림
 * => DART_PANNEL_SYNC_NOTIFICATION
 */
export const dartPannelSyncRequestHandler = async ({ socket, payload }) => {
  // * 그대로 전달
  try {
    const { sessionId, location } = payload;

    logger.info(
      '[ DART: dartPannelSyncRequestHandler ] sessionId, location ===>>> ',
      sessionId,
      location,
    );

    let sessionIds = await dartGameManager.getSessionIds(sessionId);

    // * 본인 제외  NOTIFICATION
    sessionIds = sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.DART_PANNEL_SYNC_NOTIFICATION;
    const notification = {
      sessionId,
      location,
    };
    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);
    logger.info(
      '[ DART: dartPannelSyncRequestHandler ] notification, sessionIds ===>>> ',
      notification,
      sessionIds,
    );
  } catch (error) {
    logger.error('[ DART: dartPannelSyncRequestHandler ] ', error);
  }
};

/**
 * 다트 싱크 요청
 * DART_SYNC_REQUEST
 *
 * 알림
 * => DART_SYNC_NOTIFICATION
 */
export const dartSyncRequestHandler = async ({ socket, payload }) => {
  // * 그대로 전달
  try {
    const { sessionId, angle } = payload;

    logger.info('[ DART: dartSyncRequestHandler ] sessionId, angle ===>>> ', sessionId, angle);

    let sessionIds = await dartGameManager.getSessionIds(sessionId);

    // * 본인 제외  NOTIFICATION
    sessionIds = sessionIds.filter((sId) => sId !== sessionId);

    const notificationMessageType = MESSAGE_TYPE.DART_SYNC_NOTIFICATION;
    const notification = {
      sessionId,
      angle,
    };
    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );

    socket.write(notificationPacket);
    logger.info(
      '[ DART: dartSyncRequestHandler ] notification, sessionIds ===>>> ',
      notification,
      sessionIds,
    );
  } catch (error) {
    logger.error('[ DART: dartSyncRequestHandler ] ', error);
  }
};

//DART_POINT_REQUEST
export const dartPointRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId, point } = payload;
    logger.info('[ DART: dartPointRequestHandler ] sessionId,point ==>> ', sessionId, point);

    const result = await dartGameManager.dartPoint(sessionId, Number(point));

    let sessionIds = await dartGameManager.getSessionIds(sessionId);
    // * 본인 제외  NOTIFICATION
    sessionIds = sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.DART_SYNC_NOTIFICATION;
    const notification = {
      sessionId,
      point,
    };
    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);
    logger.info(
      '[ DART: dartPointRequestHandler ] notification, sessionIds ===>>> ',
      notification,
      sessionIds,
    );

    // * 모든 턴 종료, 게임 끝
    if (result.isGameOver) {
      // * 전체한테 Noti
      sessionIds = await dartGameManager.getSessionIds(sessionId);
      const notificationMessageType = MESSAGE_TYPE.DART_GAME_OVER_NOTIFICATION;
      const notification = {
        ranks: result.ranks,
        endTime: 0,
      };
      const notificationPacket = serializeForGate(
        notificationMessageType,
        notification,
        0,
        sessionIds,
      );
      socket.write(notificationPacket);
      logger.info(
        '[ DART: dartPointRequestHandler ] notification, sessionIds ===>>> ',
        notification,
        sessionIds,
      );
    }
  } catch (error) {
    logger.error('[ DART: dartPointRequestHandler ] ', error);
  }
};

/**
 * [ 미니게임 - 다트 ] 유저 접속 종료
 *
 */
export const dartCloseSocketRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;
    // TODO: 종료 처리 예정
    logger.info('[ DART: dartGameThrowRequestHandler ] sessionId ==>> ', sessionId);
  } catch (error) {
    logger.error('[ DART: dartGameThrowRequestHandler ] ', error);
  }
};
