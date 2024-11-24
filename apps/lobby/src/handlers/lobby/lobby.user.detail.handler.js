import { MESSAGE_TYPE } from '../../utils/constants.js';
import lobbyManager from '../../classes/manager/lobby.manager.js';
import { createResponse } from '../../utils/createResponse.js';
import { getPayloadNameByMessageType } from '../index.js';
import { serialize } from '@repo/common/utils';

export const lobbyUserDetailRequestHandler = ({ socket, messageType, payload }) => {
  try {
    const { tartgetUserId } = payload;
    const result = lobbyManager.getUserDetail(tartgetUserId);

    const packet = createResponse(result, MESSAGE_TYPE.LOBBY_USER_DETAIL_RESPONSE);

    socket.write(packet);
  } catch (error) {
    console.error('[ lobbyUserDetailRequestHandler ] ====>  error ', error.message, error);
    socket.write(
      serialize(
        MESSAGE_TYPE.LOBBY_USER_DETAIL_RESPONSE,
        {
          success: false,
          userDetail: {},
          failCode: 1,
        },
        getPayloadNameByMessageType,
      ),
    );
  }
};
