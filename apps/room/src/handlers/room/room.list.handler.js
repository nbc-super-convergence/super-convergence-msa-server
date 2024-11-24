import { MESSAGE_TYPE } from '../../utils/constants.js';
import roomManager from '../../classes/manager/room.manager.js';
import { createResponse } from '../../utils/createResponse.js';
import { getPayloadNameByMessageType } from '../index.js';
import { serialize } from '@repo/common/utils';

export const roomListHandler = ({ socket, messageType, payload }) => {
  try {
    const result = roomManager.getRoomList();

    // TODO: noti 구분 추가 필요
    const packet = createResponse(result, MESSAGE_TYPE.ROOM_LIST_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ roomListHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.ROOM_LIST_RESPONSE,
        {
          success: false,
          rooms: [],
          failCode: 1,
        },
        getPayloadNameByMessageType,
      ),
    );
  }
};
