import { MESSAGE_TYPE } from '../../utils/constants.js';
import lobbyManager from '../../classes/manager/lobby.manager.js';
import { createResponse } from '../../utils/createResponse.js';
import { getPayloadNameByMessageType } from '../index.js';
import { serialize } from '@repo/common/utils';

export const lobbyJoinRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { userData } = payload;
    const result = lobbyManager.joinUser(userData);

    const packet = createResponse(result, MESSAGE_TYPE.LOBBY_JOIN_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ lobbyJoinRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.LOBBY_JOIN_RESPONSE,
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
