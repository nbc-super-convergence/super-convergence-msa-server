import Lobby from '../models/lobby.class.js';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../init/redis.js';
import { config } from '@repo/common/config';
import { ResponseHelper } from '@repo/common/classes';
import { logger } from '../../utils/logger.utils.js';

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
   * 유저의 데이터와 유저의 로비 ID를 조회
   * @param {string} sessionId 조회할 유저의 세션 ID
   * @returns userData, lobbyId
   */
  async getUserDataAndLocation(sessionId) {
    const [userData, lobbyId] = await Promise.all([
      redis.getUserToSession(sessionId),
      redis.getUserLocationField(sessionId, 'lobby'),
    ]);

    return { userData, lobbyId };
  }

  /**
   * 유저 로비 입장
   * @param {string} sessionId - 입장할 유저의 세션 ID
   * @returns {LobbyResponse} - LobbyResponse
   */
  async joinUser(sessionId) {
    try {
      const { userData, lobbyId } = await this.getUserDataAndLocation(sessionId);

      //* 유저가 존재하지 않는 경우
      if (!userData) {
        logger.error('[ joinUser ] ====> user is undefined', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_FOUND);
      }

      //* 다른 로비에 있는 경우
      if (lobbyId) {
        logger.error('[ joinUser ] ====> user is already in another lobby', { sessionId, lobbyId });
        return ResponseHelper.fail(config.FAIL_CODE.ALREADY_IN_LOBBY);
      }

      //* 로비 입장
      await redis.transaction.joinLobby(sessionId, this.lobbyId);

      logger.info('[ joinUser ] ====> success');

      const user = Lobby.formatUserData(userData, sessionId);
      return ResponseHelper.success(user);
    } catch (error) {
      logger.error('[ joinUser ] ====> unknown error', { sessionId, error });
      return ResponseHelper.fail();
    }
  }

  /**
   * 유저 로비 퇴장
   * @param {string} sessionId - 퇴장할 유저의 세션 ID
   * @returns {LobbyResponse} - LobbyResponse
   */
  async leaveUser(sessionId) {
    try {
      const { userData, lobbyId } = await this.getUserDataAndLocation(sessionId);

      //* 유저가 존재하지 않는 경우
      if (!userData) {
        logger.error('[ joinUser ] ====> user is undefined', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_FOUND);
      }

      //* 로비에 존재하는 유저가 맞는지 검증
      if (!lobbyId) {
        logger.error('[ leaveUser ] ====> user does not exist in lobby', { sessionId, lobbyId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_IN_LOBBY);
      }

      //* 로비 퇴장
      await redis.transaction.leaveLobby(sessionId, lobbyId, userData.nickname);

      logger.info('[ leaveUser ] ====> success');

      return ResponseHelper.success();
    } catch (error) {
      logger.error('[ leaveUser ] ====> unknown error', { sessionId, error });
      return ResponseHelper.fail();
    }
  }

  /**
   * 유저 상세 정보 조회
   * @param {string} targetSessionId - 조회할 유저 ID
   * @returns {LobbyResponse} - LobbyResponse
   */
  async getUserDetail(targetSessionId) {
    try {
      const { userData, lobbyId } = await this.getUserDataAndLocation(targetSessionId);

      //* 대상 유저의 데이터가 존재하는지 검증
      if (!userData) {
        logger.error('[ getUserDetail ] ====> user is undefined', { targetSessionId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_FOUND);
      }

      //* 현재 로비에 있는 유저가 맞는지 검증
      if (lobbyId !== this.lobbyId) {
        logger.error('[ getUserDetail ] ====> user does not exist in lobby', {
          targetLobby: lobbyId,
          thisLobby: this.lobbyId,
        });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_IN_LOBBY);
      }

      logger.info('[ getUserDetail ] ====> success');

      const user = Lobby.formatUserData(userData, targetSessionId);
      return ResponseHelper.success(user);
    } catch (error) {
      logger.error('[ getUserDetail ] ====> unknown error', { targetSessionId, error });
      return ResponseHelper.fail();
    }
  }

  /**
   * 현재 로비에 접속 중인 유저 목록
   * @returns {LobbyResponse} - LobbyResponse
   */
  async getUserList() {
    try {
      //* 로비의 유저 목록 조회
      const users = await redis.getLobbyUsers(this.lobbyId);
      if (!users?.length) {
        logger.error('[ getUserList ] ====> no users', { lobbyId: this.lobbyId });
        return ResponseHelper.success([]);
      }

      //* 한 번의 파이프라인으로 모든 유저 데이터 조회
      const pipeline = redis.client.pipeline();
      users.forEach((sessionId) => {
        pipeline.hget(`${redis.prefix.USER}:${sessionId}`, 'nickname');
      });
      const result = await pipeline.exec();

      const nicknames = result.map(([error, nickname]) => {
        if (error) {
          logger.error('[ getUserList ] ====> redis pipeline error', error);
        }
        return nickname;
      });

      logger.info('[ getUserList ] ====> success', { nicknames });

      return ResponseHelper.success(nicknames);
    } catch (error) {
      logger.error('[ getUserList ] ====> unknown error', { error });
      return ResponseHelper.fail();
    }
  }
}

const lobbyManagerInstance = LobbyManager.getInstance();
Object.freeze(lobbyManagerInstance);

export default lobbyManagerInstance;
