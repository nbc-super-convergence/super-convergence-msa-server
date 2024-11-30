import { MESSAGE_TYPE } from '../../utils/constants.js';
import { createResponse } from '../../utils/create.response.js';
import roomManager from '../../classes/manager/room.manager.js';
import { handleError } from '../../utils/handle.error.js';
import Room from '../../classes/models/room.class.js';
import { createNotification } from '../../utils/create.notification.js';
import { redis } from '../../init/redis.js';

export const joinRoomRequestHandler = async ({ socket, payload }) => {
  const { sessionId, roomId } = payload;

  try {
    const result = await roomManager.joinRoom(sessionId, roomId);

    const responsePacket = createResponse(result, MESSAGE_TYPE.JOIN_ROOM_RESPONSE, sessionId);
    socket.write(responsePacket);

    // 요청이 성공했으면 noti
    if (result.success) {
      const otherSessionIds = Room.getOtherSessionIds(result.data, sessionId);

      const nickname = await redis.getUserToSession(sessionId);

      const user = {
        sessionId,
        nickname,
      };

      if (otherSessionIds.length > 0) {
        const notificationPacket = createNotification(
          { userData: user },
          MESSAGE_TYPE.JOIN_ROOM_NOTIFICATION,
          otherSessionIds,
        );
        socket.write(notificationPacket);
      }
    }
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.JOIN_ROOM_RESPONSE, sessionId, error);
  }
};
