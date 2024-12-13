import danceGameManager from '../../classes/manager/dance.manager.js';
import { redis } from '../../init/redis.js';
import { GAME_STATE, MESSAGE_TYPE } from '../../utils/constants.js';
import { handleError } from '../../utils/handle.error.js';
import { logger } from '../../utils/logger.utils.js';

export const danceReadyRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;

  try {
    logger.info('[ danceReadyRequestHandler ] ====> start', { sessionId });

    const game = danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      logger.error('[ danceReadyRequestHandler ] ====> game not found');
      return;
    }

    const user = game.getUser(sessionId);
    if (!user) {
      logger.error('[ danceReadyRequestHandler ] ====> user not found');
      return;
    }

    user.setReady();

    //* 유저 준비 상태 알림
    const readyNotiBuffer = danceGameManager.danceReadyNoti(sessionId, game);
    socket.write(readyNotiBuffer);

    //* 모든 플레이어가 준비되었다면 게임 시작
    if (game.isAllReady()) {
      const startNotiBuffer = danceGameManager.danceStartNoti(game);
      logger.info('[ danceReadyRequestHandler ] ====> gameStartNoti');

      //* 게임 시작 타이머 시작
      game.startGameTimer(socket);

      socket.write(startNotiBuffer);
    }
  } catch (error) {
    logger.error('[ danceReadyRequestHandler ] ====> error', { sessionId, error });
  }
};

export const danceTableCreateRequestHandler = ({ socket, payload }) => {
  const { sessionId, dancePools } = payload;

  try {
    logger.info('[ danceTableCreateRequestHandler ] ====> start', { sessionId });

    const game = danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      logger.error('[ danceTableCreateRequestHandler ] ====> Game not found');
      return;
    }

    //* 춤표 설정
    game.setDancePools(dancePools);

    //* 테이블 생성 알림 전송
    const tableNotiBuffer = danceGameManager.danceTableNoti(dancePools, game);
    socket.write(tableNotiBuffer);
  } catch (error) {
    logger.error('[ danceTableCreateRequestHandler ] ====> error', { sessionId, error });
  }
};

export const danceKeyPressRequestHandler = ({ socket, payload }) => {
  const { sessionId, pressKey } = payload;

  try {
    logger.info('[ danceKeyPressRequestHandler ] ====> start', { sessionId, pressKey });

    const game = danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      logger.error('[ danceKeyPressRequestHandler ] ====> Game not found');
      return;
    }

    //* 키 입력 검증
    const result = game.validateKeyPress(sessionId, pressKey);

    //* 키 입력 결과 응답
    const responseBuffer = danceGameManager.danceKeyPressResponse(result, sessionId);
    socket.write(responseBuffer);

    //* 다른 플레이어들에게 알림
    const notiBuffer = danceGameManager.danceKeyPressNoti(sessionId, result, game);
    socket.write(notiBuffer);
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.DANCE_KEY_PRESS_REQUEST, sessionId, error);
  }
};

export const danceTableCompleteRequestHandler = async ({ socket, payload }) => {
  const { sessionId, endTime } = payload;

  try {
    logger.info('[ danceTableCompleteRequestHandler ] ====> start', { sessionId });

    const game = danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      logger.error('[ danceTableCompleteRequestHandler ] ====> Game not found');
      return;
    }

    //* 테이블 완료 처리
    const isGameOver = game.handleTableComplete(sessionId, endTime);
    if (isGameOver) {
      //* 게임 종료 시 타이머 정리
      game.clearTimers();

      const gameOverBuffer = await danceGameManager.danceGameOverNoti(game);
      socket.write(gameOverBuffer);
    }
  } catch (error) {
    logger.error('[ danceTableCompleteRequestHandler ] ====> error', { sessionId, error });
  }
};

export const danceCloseSocketRequestHandler = async ({ socket, payload }) => {
  try {
    const { sessionId } = payload;
    logger.info('[ danceCloseSocketRequestHandler ] ====> start', { sessionId });

    const location = await redis.getUserLocationField(sessionId, 'dance');
    if (!location) {
      logger.info('[ danceCloseSocketRequestHandler ] ====> not a user in the dance game');
      return;
    }

    const game = danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      logger.error('[ danceCloseSocketRequestHandler ] ====> Game not found');
      return;
    }

    //* 연결 종료 처리 및 대체 플레이어 찾기
    const replacementInfo = await game.handleDisconnect(sessionId);
    if (replacementInfo) {
      const notiBuffer = danceGameManager.danceCloseSocketNoti(game, sessionId);
      socket.write(notiBuffer);
    }

    //* 유저가 1명이면 게임 종료
    if (game.users.size <= 1) {
      //* 타이머 제거
      game.clearTimers();

      const gameOverBuffer = await danceGameManager.danceGameOverNoti(game);
      socket.write(gameOverBuffer);
    }

    //* 설명창에서 유저가 나간 후 모두 준비 상태면 게임 시작
    if (game.state === GAME_STATE.WAIT && game.isAllReady()) {
      const startNotiBuffer = danceGameManager.danceStartNoti(game);
      logger.info('[ danceCloseSocketRequestHandler ] ====> gameStartNoti');

      //* 게임 시작 타이머 시작
      game.startGameTimer(socket);

      socket.write(startNotiBuffer);
    }
  } catch (error) {
    logger.error('[ danceCloseSocketRequestHandler ] ====> error', error);
  }
};
