import { v4 as uuidv4 } from 'uuid';
import { gameSessions } from './sessions.js';
import iceGame from '../classes/models/ice.game.class.js';

/**
 * 게임 세션 생성
 * @returns gameSession
 */
export const addGameSession = async () => {
  // TODO: 게임 아이디 어떻게 관리할지
  const game = new iceGame('testGameId');
  gameSessions.push(game);

  console.log(`게임 세션임`, gameSessions);
  return game;
};

/**
 * 게임 세션 삭제
 * @param {*} sessionId
 */
export const removeGameSessionById = (sessionId) => {
  const index = gameSessions.findIndex((session) => session.id === sessionId);
  if (index !== -1) {
    const remvoedGameSession = gameSessions.splice(index, 1)[0];
    remvoedGameSession.intervalManager.clearAll();
    return remvoedGameSession;
  }
};

/**
 * 특정 게임 세션 조회
 * @param {*} sessionId
 * @returns
 */
export const getGameSessionById = (sessionId) => {
  return gameSessions.find((game) => game.id === sessionId);
};

/**
 * 전체 게임 세션 조회
 * @returns
 */
export const getAllGameSessions = () => {
  return gameSessions;
};

export const addTestGameSession = async () => {
  const game = new iceGame('testGameId', 'ice');
  gameSessions.push(game);
  return game;
};
