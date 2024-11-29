import iceGameManager from '../classes/managers/ice.game.manager.js';
import iceUserManager from '../classes/managers/ice.user.manager.js';

export const iceGameReadyRequestHandler = async ({ socket, payload }) => {
  try {
    console.log(`Start [iceGameReadyRequestHandler]`);
    const { sessionId } = payload;

    const user = iceUserManager.getUserBySessionId(sessionId);

    if (!iceUserManager.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    const game = iceGameManager.getGameBySessionId(user.gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    // * iceGameReadyNotification
    let buffer = await iceGameManager.iceGameReadyNoti(user, game);

    // * iceMiniGameStartNotification
    if (game.isAllReady()) {
      buffer = await iceGameManager.iceMiniGameStartNoti(socket, game);
    }

    // TODO: 마지막 남은 유저가 준비했을 때 굳이 2개를 보내야 할까?
    socket.write(buffer);
  } catch (error) {
    console.error(`[iceGameReadyRequestHandler] ===> `, error);
  }
};

export const icePlayerSyncRequestHandler = async ({ socket, payload }) => {
  try {
    console.log(`Start [icePlayerSyncRequestHandler]`);

    const user = iceUserManager.getUserBySessionId(payload.sessionId);

    if (!iceUserManager.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
      // TODO: error부분 나중에 globalFailCode로 처리
    }

    const game = iceGameManager.getGameBySessionId(user.gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    // * icePlayerSyncNotification
    const buffer = await iceUserManager.icePlayerSyncNoti(user, game, payload);

    socket.write(buffer);
  } catch (error) {
    console.error(`[icePlayerSyncRequestHandler] ===> `, error);
  }
};

export const icePlayerDamageRequestHandler = async ({ socket, payload }) => {
  try {
    console.log(`Start [icePlayerDamageRequestHandler]`);

    const { sessionId } = payload;

    const user = iceUserManager.getUserBySessionId(sessionId);

    if (!iceUserManager.isValidUser(user)) {
      throw new Error(`유저가 존재하지 않습니다.`);
    }

    const game = iceGameManager.getGameBySessionId(user.gameId);

    if (!iceGameManager.isValidGame(game)) {
      throw new Error(`sessionId가 일치하는 게임이 존재하지 않습니다.`);
    }

    // * icePlayerDamageNotification
    const damageBuffer = await iceUserManager.icePlayerDamageNoti(user, game);

    // * icePlayerDeathNotification
    const deathBuffer = await iceUserManager.icePlayerDeathNoti(user, game);

    socket.write(deathBuffer ? deathBuffer : damageBuffer);

    // * iceGameOverNotification
    await iceGameManager.iceGameOver(socket, game);
  } catch (error) {
    console.error('[icePlayerDamageRequestHandler] ===> ', error);
  }
};
