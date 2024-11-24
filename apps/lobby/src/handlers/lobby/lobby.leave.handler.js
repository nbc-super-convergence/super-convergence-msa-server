import { MESSAGE_TYPE } from '../../utils/constants.js';
import lobbyManager from '../../classes/manager/lobby.manager.js';
import { createResponse } from '../../utils/createResponse.js';
import { getPayloadNameByMessageType } from '../index.js';
import { serialize } from '@repo/common/utils';

export const lobbyLeaveRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { userId } = payload;
    const result = lobbyManager.leaveUser(userId);

    const packet = createResponse(result, MESSAGE_TYPE.LOBBY_LEAVE_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ lobbyLeaveRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.LOBBY_LEAVE_RESPONSE,
        {
          success: false,
          failCode: 1,
        },
        getPayloadNameByMessageType,
      ),
    );
  }
};
