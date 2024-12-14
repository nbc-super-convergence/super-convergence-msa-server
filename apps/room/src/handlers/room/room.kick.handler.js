import { MESSAGE_TYPE } from '../../utils/constants.js';
import roomManager from '../../classes/manager/room.manager.js';
import { createResponse } from '../../utils/create.response.js';
import { handleError } from '../../utils/handle.error.js';
import { createNotification } from '../../utils/create.notification.js';
import Room from '../../classes/models/room.class.js';

export const roomKickRequestHandler = async ({ socket, payload }) => {
  const { sessionId, targetSessionId } = payload;

  try {
    const result = await roomManager.kickUser(sessionId, targetSessionId);

    const responsePacket = createResponse(result, MESSAGE_TYPE.ROOM_KICK_RESPONSE, sessionId);
    socket.write(responsePacket);

    //* 요청이 성공했으면 noti
    if (result.success) {
      const otherSessionIds = Room.getOtherSessionIds(result.data, sessionId);

      if (otherSessionIds.length > 0) {
        const notificationPacket = createNotification(
          { room: result.data },
          MESSAGE_TYPE.ROOM_KICK_NOTIFICATION,
          otherSessionIds,
        );
        socket.write(notificationPacket);
      }
    }
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.ROOM_KICK_RESPONSE, sessionId, error);
  }
};
