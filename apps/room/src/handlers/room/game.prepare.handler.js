import { MESSAGE_TYPE } from '../../utils/constants.js';
import roomManager from '../../classes/manager/room.manager.js';
import { createResponse } from '../../utils/create.response.js';
import { handleError } from '../../utils/handle.error.js';
import { redis } from '../../init/redis.js';
import RoomDTO from '../../classes/models/room.dto.js';
import Room from '../../classes/models/room.class.js';
import { createNotification } from '../../utils/create.notification.js';

export const gamePrepareRequestHandler = async ({ socket, payload }) => {
  const { sessionId, isReady } = payload;

  try {
    const result = await roomManager.updateReady(sessionId, isReady);

    const responsePacket = createResponse(result, MESSAGE_TYPE.GAME_PREPARE_RESPONSE, sessionId);
    socket.write(responsePacket);

    //* 요청이 성공했으면 noti
    if (result.success) {
      //* 대기방 데이터 조회
      const roomId = await redis.getUserLocationField(sessionId, 'room');
      const roomData = RoomDTO.fromRedis(await redis.getRoom(roomId));

      const otherSessionIds = Room.getOtherSessionIds(
        await RoomDTO.toResponse(roomData),
        sessionId,
      );

      if (otherSessionIds.length > 0) {
        const notificationPacket = createNotification(
          {
            userData: result.userData,
            isReady,
            state: result.state,
          },
          MESSAGE_TYPE.GAME_PREPARE_NOTIFICATION,
          otherSessionIds,
        );
        socket.write(notificationPacket);
      }
    }
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.GAME_PREPARE_RESPONSE, sessionId, error);
  }
};
