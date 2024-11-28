import Lobby from '../models/lobby.class.js';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../init/redis.js';
import { logger } from '@repo/common/config';

class LobbyManager {
  constructor() {
    if (LobbyManager.instance) {
      return LobbyManager.instance;
    }

    this.lobbyId = uuidv4();
    LobbyManager.instance = this;
  }

  static getInstance() {
    if (!LobbyManager.instance) {
      LobbyManager.instance = new LobbyManager();
    }
    return LobbyManager.instance;
  }

  /**
   * 유저 로비 입장
   * @param {string} sessionId - 입장할 유저의 세션 ID
   * @returns {LobbyResponse} - LobbyResponse
   */
  async joinUser(sessionId) {
    try {
      // 유저 세션 검증
      const userData = await redis.getUserToSession(sessionId);
      logger.info('[ joinUser ] ====> userData', { sessionId, userData });
      if (!userData) {
        logger.error('[ joinUser ] ====> user is undefined', { sessionId });
        return { success: false, data: null, failCode: 1 };
      }

      // 이미 로비에 있는 유저인지 검증
      const existingLobbyId = await redis.getUserLocationField(sessionId, 'lobby');
      logger.info('[ joinUser ] ====> existingLobbyId', { sessionId, existingLobbyId });
      if (existingLobbyId) {
        logger.error('[ joinUser ] ====> user is already in another lobby', { sessionId });
        return { success: false, data: null, failCode: 1 };
      }

      // 로비 입장
      await redis.transaction.joinLobby(sessionId, this.lobbyId);

      logger.info('[ joinUser ] ====> success', userData);

      return { success: true, data: Lobby.formatUserData(userData), failCode: 0 };
    } catch (error) {
      logger.error('[ joinUser ] ====> unknown error', error);
      return { success: false, data: null, failCode: 1 };
    }
  }

  /**
   * 유저 로비 퇴장
   * @param {string} sessionId - 퇴장할 유저의 세션 ID
   * @returns {LobbyResponse} - LobbyResponse
   */
  async leaveUser(sessionId) {
    try {
      // 로비에 존재하는 유저가 맞는지 검증
      const lobbyId = await redis.getUserLocationField(sessionId, 'lobby');
      if (!lobbyId) {
        logger.error('[ leaveUser ] ====> user does not exist in lobby', { sessionId });
        return { success: false, data: null, failCode: 1 };
      }

      // 퇴장
      await redis.transaction.leaveLobby(sessionId, lobbyId);

      logger.info('[ leaveUser ] ====> success');

      return { success: true, data: null, failCode: 0 };
    } catch (error) {
      logger.error('[ leaveUser ] ====> unknown error', error);
      return { success: false, data: null, failCode: 1 };
    }
  }

  /**
   * 유저 상세 정보 조회
   * @param {string} targetSessionId - 조회할 유저 ID
   * @returns {LobbyResponse} - LobbyResponse
   */
  async getUserDetail(targetSessionId) {
    try {
      // 대상 유저의 데이터가 존재하는지 검증
      const userData = await redis.getUserToSession(targetSessionId);
      if (!userData) {
        logger.error('[ getUserDetail ] ====> user is undefined', { targetSessionId });
        return { success: false, data: null, failCode: 1 };
      }

      // 로비에 있는 유저가 맞는지 검증
      const isInLobby = await Lobby.isUserInLobby(this.lobbyId, targetSessionId);
      if (!isInLobby) {
        logger.error('[ getUserDetail ] ====> user does not exist in lobby', {
          targetSessionId,
          lobbyId: this.lobbyId,
        });

        return { success: false, data: null, failCode: 1 };
      }

      logger.info('[ getUserDetail ] ====> success', userData);

      return { success: true, data: Lobby.formatUserData(userData), failCode: 0 };
    } catch (error) {
      logger.error('[ getUserDetail ] ====> unknown error', error);
      return { success: false, data: null, failCode: 1 };
    }
  }

  /**
   * 현재 로비에 접속 중인 유저 목록
   * @returns {LobbyResponse} - LobbyResponse
   */
  async getUserList() {
    try {
      // 유저 목록 조회
      const users = await redis.getLobbyUsers(this.lobbyId);
      if (!users) {
        logger.error('[ getUserList ] ====> no users', { lobbyId: this.lobbyId });
        return { success: true, data: [], failCode: 0 };
      }

      const userList = await Promise.all(
        users.map(async (sessionId) => {
          const userData = await redis.getUserToSession(sessionId);
          return userData ? userData.nickname : null;
        }),
      );

      logger.info('[ getUserList ] ====> success', userList.filter(Boolean));

      return { success: true, data: userList.filter(Boolean), failCode: 0 };
    } catch (error) {
      logger.error('[ getUserList ] ====> unknown error', error);
      return { success: false, data: null, failCode: 1 };
    }
  }
}

const lobbyManagerInstance = LobbyManager.getInstance();
Object.freeze(lobbyManagerInstance);

export default lobbyManagerInstance;
