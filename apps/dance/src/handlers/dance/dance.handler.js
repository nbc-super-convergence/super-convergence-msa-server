import danceGameManager from '../../classes/manager/dance.manager.js';
import { MESSAGE_TYPE } from '../../utils/constants.js';
import { handleError } from '../../utils/handle.error.js';
import { logger } from '../../utils/logger.utils.js';

export const danceReadyRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;

  try {
    logger.info('[ danceReadyRequestHandler ] ====> start', { sessionId });

    const game = await danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      throw new Error('[ danceReadyRequestHandler ] ====> game not found');
    }

    const user = game.getUser(sessionId);
    if (!user) {
      throw new Error('[ danceReadyRequestHandler ] ====> user not found');
    }

    user.setReady();

    //* 유저 준비 상태 알림
    const readyNotiBuffer = await danceGameManager.danceReadyNoti(sessionId, game);
    socket.write(readyNotiBuffer);

    //* 모든 플레이어가 준비되었다면 게임 시작
    if (game.isAllReady()) {
      const startNotiBuffer = await danceGameManager.danceStartNoti(game);
      socket.write(startNotiBuffer);
    }
  } catch (error) {
    logger.error('[ danceReadyRequestHandler ] ====> error', { sessionId, error });
  }
};

export const danceTableCreateRequestHandler = async ({ socket, payload }) => {
  const { sessionId, dancePools } = payload;

  try {
    logger.info('[ danceTableCreateRequestHandler ] ====> start', { sessionId });

    const game = await danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      throw new Error('[ danceTableCreateRequestHandler ] ====> Game not found');
    }

    //* 춤표 설정
    game.setDancePools(dancePools);

    //* 테이블 생성 알림 전송
    const tableNotiBuffer = await danceGameManager.danceTableNoti(dancePools, game);
    socket.write(tableNotiBuffer);
  } catch (error) {
    logger.error('[ danceTableCreateRequestHandler ] ====> error', { sessionId, error });
  }
};

export const danceKeyPressRequestHandler = async ({ socket, payload }) => {
  const { sessionId, pressKey } = payload;

  try {
    logger.info('[ danceKeyPressRequestHandler ] ====> start', { sessionId, pressKey });

    const game = await danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      throw new Error('[ danceKeyPressRequestHandler ] ====> Game not found');
    }

    //* 키 입력 검증
    const result = game.validateKeyPress(sessionId, pressKey);

    //* 키 입력 결과 응답
    const responseBuffer = await danceGameManager.danceKeyPressResponse(result, sessionId);
    socket.write(responseBuffer);

    //* 다른 플레이어들에게 알림
    const notiBuffer = await danceGameManager.danceKeyPressNoti(sessionId, result, game);
    socket.write(notiBuffer);
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.DANCE_KEY_PRESS_REQUEST, sessionId, error);
  }
};

export const danceTableCompleteRequestHandler = async ({ socket, payload }) => {
  const { sessionId, endTime } = payload;

  try {
    logger.info('[ danceTableCompleteRequestHandler ] ====> start', { sessionId });

    const game = await danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      throw new Error('[ danceTableCompleteRequestHandler ] ====> Game not found');
    }

    //* 테이블 완료 처리
    const isGameOver = game.handleTableComplete(sessionId, endTime);
    if (isGameOver) {
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

    const game = await danceGameManager.getGameBySessionId(sessionId);
    if (!game) {
      throw new Error('[ danceTableCompleteRequestHandler ] ====> Game not found');
    }

    //* 연결 종료 처리 및 대체 플레이어 찾기
    const replacementInfo = game.handleDisconnect(sessionId);
    if (replacementInfo) {
      const notiBuffer = await danceGameManager.danceCloseSocketNoti(game, sessionId);
      socket.write(notiBuffer);
    }
  } catch (error) {
    logger.error('[ danceCloseSocketRequestHandler ] ====> error', error);
  }
};
