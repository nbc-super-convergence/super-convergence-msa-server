import { logger } from '@repo/common/config';

class RoomDTO {
  static fromRedis(redisData) {
    try {
      if (!redisData) return null;

      return {
        roomId: redisData.roomId,
        ownerId: redisData.ownerId,
        roomName: redisData.roomName,
        lobbyId: redisData.lobbyId,
        state: redisData.state,
        users: new Set(JSON.parse(redisData.users)),
        maxUser: parseInt(redisData.maxUser),
        readyUsers: redisData.readyUsers ? new Set(JSON.parse(redisData.readyUsers)) : [],
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
        state: roomData.state,
        users: JSON.stringify(Array.from(roomData.users)),
        maxUser: roomData.maxUser,
        readyUsers: JSON.stringify(Array.from(roomData.readyUsers)),
      };
    } catch (error) {
      logger.error('[ toRedis ] ====> unknown error', error);
    }
  }

  static toResponse(roomData) {
    try {
      if (!roomData) return null;

      return {
        roomId: roomData.roomId,
        ownerId: roomData.ownerId,
        roomName: roomData.roomName,
        lobbyId: roomData.lobbyId,
        state: roomData.state,
        users: Array.from(roomData.users),
        maxUser: roomData.maxUser,
        readyUsers: Array.from(roomData.readyUsers),
      };
    } catch (error) {
      logger.error('[ toResponse ] ====> unknown error', error);
    }
  }
}

export default RoomDTO;
