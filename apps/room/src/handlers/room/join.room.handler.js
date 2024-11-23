import { MESSAGE_TYPE } from '../../utils/constants.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../index.js';
import { createResponse } from '../../utils/createResponse.js';
import roomManager from '../../classes/manager/room.manager.js';

export const joinRoomRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { roomId, userData } = payload;
    const result = roomManager.joinRoom(roomId, userData);

    // TODO: noti 구분 추가 필요
    const packet = createResponse(result, MESSAGE_TYPE.JOIN_ROOM_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ joinRoomRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.JOIN_ROOM_RESPONSE,
        {
          success: false,
          room: {},
          failCode: 1,
        },
        getPayloadNameByMessageType,
      ),
    );
  }
};
