import { MESSAGE_TYPE } from '../../utils/constants.js';
import roomManager from '../../classes/manager/room.manager.js';
import { createResponse } from '../../utils/createResponse.js';
import { getPayloadNameByMessageType } from '../index.js';
import { serialize } from '@repo/common/utils';

export const gamePrepareRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { userId, isReady } = payload;
    const result = roomManager.updateReady(userId, isReady);

    // TODO: noti 구분 추가 필요
    const packet = createResponse(result, MESSAGE_TYPE.GAME_PREPARE_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ gamePrepareRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.GAME_PREPARE_RESPONSE,
        {
          success: false,
          isReady: false,
          failCode: 1,
        },
        getPayloadNameByMessageType,
      ),
    );
  }
};
