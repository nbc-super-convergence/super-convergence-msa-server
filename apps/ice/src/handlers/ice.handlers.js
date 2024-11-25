import { v4 as uuidv4 } from 'uuid';
import { logger } from '@repo/common/config';
import { addUser, getUserBySocket } from '../sessions/user.session.js';
import { getGameSessionById } from '../sessions/game.session.js';
import { icePlayerMoveNotification } from '../notifications/ice.notifications.js';

/**
 * 빙판 게임 참가
 * @param {*} param
 */
export const iceJoinRequestHandler = ({ socket, payload }) => {
  const { playerId } = payload;

  /**
   * TODO: 유저에게 게임 세션 아이디를 언제 줄 것인가?
   * TODO: 유저의 상태 동기화, 맵 동기화 필요!
   */
  let user = getUserBySocket(socket);

  // TODO: 테스트용
  if (!user) {
    const id = uuidv4();
    user = addUser(socket, id);
  }

  const gameId = user.getGameId();

  const game = getGameSessionById(gameId);

  console.log(`게임인데요`, game);
  game.addUser(user);
};

/**
 * 빙판 게임 플레이어 위치 업데이트
 * @param {*} param
 */
export const icePlayerMoveRequestHandler = ({ socket, payload }) => {
  try {
    const { playerId, position, vector, rotation, state } = payload;

    const user = getUserBySocket(socket); // 유저 찾기
    if (!user) {
      throw new Error(`유저를 찾을 수 없습니다.`);
    }

    const player = user.player; // 유저의 플레이어
    player.updatePosition(position, vector, rotation); // 위치 업데이트

    const gameSession = getGameSessionById(user.gameId); // 유저가 참가한 게임 세션 찾기
    if (!gameSession) {
      throw new Error(`게임 세션를 찾을 수 없습니다.`);
    }

    const userPositions = gameSession.getUserPosition(); // 세션 내 유저의 위치 정보 조회

    const packet = icePlayerMoveNotification(userPositions); // 이동 동기화 패킷 생성

    gameSession.notifyOtherUsers(packet, user.id); // 세션 내 본인 이외의 유저에서 패킷 전송
  } catch (error) {
    logger.error(`[ icePlayerMoveRequestHandler ] error =>>> `, error.message, error);
  }
};

/**
 * 테스트 게임용 준비 완료 요청
 * @param {*} param
 */
export const iceStartRequestHandler = ({ socket, payload }) => {
  // 테스트 게임 용
  try {
    const user = getUserBySocket(socket);

    if (!user) {
      throw new Error(`유저를 찾을 수 없습니다.`);
    }

    const gameSession = getGameSessionById(user.gameId);

    // 테스트 환경 : 준비 완료된 유저 각자 시작
    gameSession.startTestGame(user.id);
  } catch (error) {
    logger.error(`[ icePlayerMoveRequestHandler ] error =>>> `, error.message, error);
  }
};
