import iceGameManager from '../classes/managers/ice.game.manager.js';
import iceUserManager from '../classes/managers/ice.user.manager.js';
import {
  iceGameReadyNotification,
  iceGameStartNotification,
  iceMiniGameStartNotification,
  icePlayerDamageNotification,
  icePlayerDeathNotification,
  icePlayerSyncNotification,
} from '../utils/ice.notifications.js';
import { serializeForGate } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { logger } from '@repo/common/config';
import { gameState } from '../constants/gameState.js';

export const iceMiniGameStartRequestHandler = async ({ socket, payload }) => {
  try {
    // ! 방장의 세션아이디
    const { sessionId } = payload;

    const game = iceGameManager.getGameBySessionId(sessionId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    // * 게임 상태 변경
    game.setState(gameState.START);

    // * 게임 시작 Notification
    const sessionIds = game.getAllSessionIds();

    const users = game.getAllUserBySessionId(sessionId);

    const message = iceMiniGameStartNotification(users, Date.now());

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[iceMiniGameStartRequestHandler]====> `, error);
  }
};

export const iceGameReadyRequestHandler = ({ socket, payload }) => {
  try {
    const { playerId } = payload;

    // ! 세션 아이디로 유저 조회
    const user = iceUserManager.getUserByPlayerId(playerId);

    if (!iceUserManager.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    user.player.isReady = true;

    const game = iceGameManager.getGameBySessionId(user.sessionId);

    const sessionIds = game.getOtherSessionIds(user.id);

    const message = iceGameReadyNotification(user.player.id);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    socket.write(buffer);

    // ! 모든 유저가 준비가 끝났을 경우
    if (game.getReadyCounts() === game.users.length) {
      console.log(`모든 유저 준비 완료`);

      const sessionIds = game.getAllSessionIds();

      const message = iceGameStartNotification(Date.now());

      const payloadType = getPayloadNameByMessageType(message.type);

      const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

      socket.write(buffer);

      // * 맵 변경, 게임 종료 타이머
      game.changeMap(socket);
      game.iceGameTimer(socket);
    }
  } catch (error) {
    logger.error(`[iceGameReadyRequestHandler] ===> `, error);
  }
};

export const icePlayerSyncRequestHandler = ({ socket, payload }) => {
  try {
    const { playerId, position, rotation, state } = payload;

    const user = iceUserManager.getUserByPlayerId(playerId);

    user.player.updateState(position, rotation, state);

    // * 유저 상태 정보 noti
    const game = iceGameManager.getGameBySessionId(user.sessionId);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerSyncNotification(user);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    socket.write(buffer);
  } catch (error) {
    logger.error(`[icePlayerSyncRequestHandler] ===> `, error);
  }
};

export const icePlayerDamageRequestHandler = ({ socket, payload }) => {
  try {
    const { playerId } = payload;

    const user = iceUserManager.getUserByPlayerId(playerId);

    const game = iceGameManager.getGameBySessionId(user.sessionId);

    // 플레이어 데미지
    user.player.damage();

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    // * noti
    const message = icePlayerDamageNotification(user.player.id);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, payloadType, sessionIds);

    socket.write(buffer);

    if (user.player.hp <= 0) {
      user.player.playerDead();

      // * 사망시 랭킹 매겨주기
      user.player.rank = game.getAliveUser().length + 1;

      const message = icePlayerDeathNotification(user);

      const payloadType = getPayloadNameByMessageType(message.type);

      const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

      socket.write(buffer);

      // * 유저 1명 => 게임 종료
      if (iceUserManager.getAliveUserLength() <= 1) {
        const user = game.getAliveUser()[0];

        user.player.rank = 1;

        game.handleGameEnd(socket);
      }
    }
  } catch (error) {
    logger.error('[icePlayerDamageRequestHandler] ===> ', error);
  }
};
