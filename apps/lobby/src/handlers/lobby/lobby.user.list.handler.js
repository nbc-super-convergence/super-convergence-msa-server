import { MESSAGE_TYPE } from '../../utils/constants.js';
import lobbyManager from '../../classes/manager/lobby.manager.js';
import { createResponse } from '../../utils/createResponse.js';
import { getPayloadNameByMessageType } from '../index.js';
import { serialize } from '@repo/common/utils';

export const lobbyUserListRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const result = lobbyManager.getUserList();

    const packet = createResponse(result, MESSAGE_TYPE.LOBBY_USER_LIST_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ lobbyUserListRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.LOBBY_USER_LIST_RESPONSE,
        {
          success: false,
          userList: [],
          failCode: 1,
        },
        0,
        getPayloadNameByMessageType,
      ),
    );
  }
};
