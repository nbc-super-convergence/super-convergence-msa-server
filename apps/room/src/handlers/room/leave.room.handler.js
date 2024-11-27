import { MESSAGE_TYPE } from '../../utils/constants.js';
import { createResponse } from '../../utils/create.response.js';
import roomManager from '../../classes/manager/room.manager.js';
import { handleError } from '../../utils/handle.error.js';
import Room from '../../classes/models/room.class.js';
import { createNotification } from '../../utils/create.notification.js';

export const leaveRoomRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;

  try {
    const result = await roomManager.leaveRoom(sessionId);

    const responsePacket = createResponse(result, MESSAGE_TYPE.LEAVE_ROOM_RESPONSE, sessionId);
    socket.write(responsePacket);

    // 요청이 성공했으면 noti
    if (result.success && result.data?.users.size > 0) {
      const otherSessionIds = Room.getOtherSessionIds(result.data, sessionId);

      if (otherSessionIds.length > 0) {
        // 퇴장 알림
        const leaveNotificationPacket = createNotification(
          { userData: result.userData },
          MESSAGE_TYPE.LEAVE_ROOM_NOTIFICATION,
          otherSessionIds,
        );
        socket.write(leaveNotificationPacket);

        // 상태가 변경되었다면 게임 준비 상태 알림도 전송
        if (result.stateChanged) {
          const gamePrepareNotificationPacket = createNotification(
            {
              userData: result.userData,
              isReady: false,
              state: result.data.state,
            },
            MESSAGE_TYPE.GAME_PREPARE_NOTIFICATION,
            otherSessionIds,
          );
          socket.write(gamePrepareNotificationPacket);
        }
      }
    }
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.LEAVE_ROOM_RESPONSE, sessionId, error);
  }
};
