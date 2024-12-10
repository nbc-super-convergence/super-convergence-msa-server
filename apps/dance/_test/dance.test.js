import danceGameManager from '../src/classes/manager/dance.manager.js';
import { danceConfig } from '../src/config/config.js';
import { logger } from '../src/utils/logger.utils.js';

const { DIRECTION } = danceConfig;

async function testDanceGame() {
  try {
    //* 1. 게임 생성 테스트
    const gameId = 'test-game-1';
    const users = ['session1', 'session2', 'session3', 'session4'];
    const game = danceGameManager.createGame(gameId, users);

    logger.info('Game created:', game);
    logger.info('Users in game:', Array.from(game.users.values()));

    //* 2. 댄스 풀 설정 테스트
    const dancePools = [
      {
        sessionId: 'session1',
        danceTables: [
          {
            commands: [
              { direction: DIRECTION.UP, targetSessionId: 'session1' },
              { direction: DIRECTION.DOWN, targetSessionId: 'session2' },
            ],
          },
        ],
      },
      {
        sessionId: 'session2',
        danceTables: [
          {
            commands: [
              { direction: DIRECTION.LEFT, targetSessionId: 'session2' },
              { direction: DIRECTION.RIGHT, targetSessionId: 'session1' },
            ],
          },
        ],
      },
    ];

    game.setDancePools(dancePools);
    logger.info('Dance pools set:', game.dancePools);

    //* 3. 유저 준비 상태 테스트
    for (const sessionId of users) {
      const user = game.getUser(sessionId);
      user.setReady();
      logger.info(`User ${sessionId} ready state:`, user.isReady);
    }

    //* 4. 키 입력 검증 테스트
    const keyPressResult = game.validateKeyPress('session1', DIRECTION.UP);
    logger.info('Key press validation result:', keyPressResult);

    //* 5. 게임 완료 테스트
    game.handleTableComplete('session1', Date.now());
    const gameResults = game.getGameResults();
    logger.info('Game results:', gameResults);

    //* 6. 연결 종료 처리 테스트
    const disconnectResult = game.handleDisconnect('session1');
    logger.info('Disconnect handling result:', disconnectResult);

    //* 7. 게임 매니저 기능 테스트
    const gameBySession = danceGameManager.getGameBySessionId('session1');
    logger.info('Game found by session:', gameBySession?.id);

    //* 8. 게임 삭제 테스트
    danceGameManager.deleteGame(gameId);
    const deletedGame = danceGameManager.getGameBySessionId('session1');
    logger.info('Game after deletion:', deletedGame);
  } catch (error) {
    logger.error('Test failed:', error);
  }
}

//* 테스트 실행
testDanceGame();
