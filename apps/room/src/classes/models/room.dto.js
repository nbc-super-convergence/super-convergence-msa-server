import { redis } from '../../init/redis.js';
import { logger } from '../../utils/logger.utils.js';

class RoomDTO {
  static fromRedis(redisData) {
    try {
      if (!redisData) return null;

      logger.info('[ fromRedis ] ====> redisData', { redisData });

      return {
        roomId: redisData.roomId,
        ownerId: redisData.ownerId,
        roomName: redisData.roomName,
        lobbyId: redisData.lobbyId,
        state: parseInt(redisData.state),
        users: new Set(redisData.users ? JSON.parse(redisData.users) : []),
        maxUser: parseInt(redisData.maxUser),
        readyUsers: new Set(redisData.readyUsers ? JSON.parse(redisData.readyUsers) : []),
      };
    } catch (error) {
      logger.error('[ fromRedis ] ====> unknown error', error);
    }
  }

  static toRedis(roomData) {
    try {
      if (!roomData) return null;

      return {
        roomId: roomData.roomId,
        ownerId: roomData.ownerId,
        roomName: roomData.roomName,
        lobbyId: roomData.lobbyId,
        state: roomData.state.toString(),
        users: JSON.stringify(Array.from(roomData.users)),
        maxUser: roomData.maxUser.toString(),
        readyUsers: JSON.stringify(Array.from(roomData.readyUsers)),
      };
    } catch (error) {
      logger.error('[ toRedis ] ====> unknown error', error);
    }
  }

  static async toResponse(roomData) {
    try {
      if (!roomData) return null;

      // users가 문자열인 경우 파싱
      let userIds = [];
      if (typeof roomData.users === 'string') {
        userIds = JSON.parse(roomData.users);
      } else if (roomData.users instanceof Set) {
        userIds = Array.from(roomData.users);
      } else if (Array.isArray(roomData.users)) {
        userIds = roomData.users.map((user) => user.sessionId);
      }

      //* 클러스터 환경에서는 Promise.all로 병렬 처리
      const userDataPromises = userIds.map(async (sessionId) => {
        try {
          const userData = await redis.client.hgetall(`${redis.prefix.USER}:${sessionId}`);
          return userData
            ? {
                sessionId,
                nickname: userData.nickname,
              }
            : null;
        } catch (error) {
          logger.error(`[ toResponse ] ====> Error redis ${sessionId}:`, error);
          return null;
        }
      });

      const users = (await Promise.all(userDataPromises)).filter((user) => user !== null);

      return {
        roomId: roomData.roomId,
        ownerId: roomData.ownerId,
        roomName: roomData.roomName,
        lobbyId: roomData.lobbyId,
        state: Number(roomData.state),
        users,
        maxUser: Number(roomData.maxUser),
        readyUsers: Array.from(roomData.readyUsers),
      };
    } catch (error) {
      logger.error('[ toResponse ] ====> unknown error', error);
    }
  }
}

export default RoomDTO;
