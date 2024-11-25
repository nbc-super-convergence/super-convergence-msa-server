import { MESSAGE_TYPE } from '../../utils/constants.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../index.js';
import { createResponse } from '../../utils/createResponse.js';
import roomManager from '../../classes/manager/room.manager.js';

export const leaveRoomRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { userId } = payload;
    const result = roomManager.leaveRoom(userId);

    // TODO: noti 구분 추가 필요
    const packet = createResponse(result, MESSAGE_TYPE.LEAVE_ROOM_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ leaveRoomRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.LEAVE_ROOM_RESPONSE,
        {
          success: false,
          failCode: 1,
        },
        0,
        getPayloadNameByMessageType,
      ),
    );
  }
};
