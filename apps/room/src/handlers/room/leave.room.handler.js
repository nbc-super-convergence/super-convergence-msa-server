import { MESSAGE_TYPE } from '../../utils/constants.js';
import { createResponse } from '../../utils/create.response.js';
import roomManager from '../../classes/manager/room.manager.js';
import { handleError } from '../../utils/handle.error.js';
import Room from '../../classes/models/room.class.js';
import { createNotification } from '../../utils/create.notification.js';
import { redis } from '../../init/redis.js';
import RoomDTO from '../../classes/models/room.dto.js';

export const leaveRoomRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;

  try {
    //* 나가기 전 대기방 데이터 저장
    const roomId = await redis.getUserLocationField(sessionId, 'room');
    const roomData = RoomDTO.fromRedis(await redis.getRoom(roomId));

    const result = await roomManager.leaveRoom(sessionId);

    const responsePacket = createResponse(result, MESSAGE_TYPE.LEAVE_ROOM_RESPONSE, sessionId);
    socket.write(responsePacket);

    //* 요청이 성공했으면 noti
    if (result.success) {
      const otherSessionIds = Room.getOtherSessionIds(
        await RoomDTO.toResponse(roomData),
        sessionId,
      );

      if (otherSessionIds.length > 0) {
        //* 퇴장 알림
        const leaveNotificationPacket = createNotification(
          { room: result.data },
          MESSAGE_TYPE.LEAVE_ROOM_NOTIFICATION,
          otherSessionIds,
        );
        socket.write(leaveNotificationPacket);
      }
    }
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.LEAVE_ROOM_RESPONSE, sessionId, error);
  }
};
