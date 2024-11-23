import { MESSAGE_TYPE } from '../../utils/constants.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../index.js';
import { createResponse } from '../../utils/createResponse.js';
import roomManager from '../../classes/manager/room.manager.js';

export const createRoomRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { userId, roomName } = payload;
    const result = roomManager.createRoom(userId, roomName);

    // TODO: noti 구분 추가 필요
    const packet = createResponse(result, MESSAGE_TYPE.CREATE_ROOM_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ createRoomRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.CREATE_ROOM_RESPONSE,
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
