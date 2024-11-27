import { MESSAGE_TYPE } from '../../utils/constants.js';
import roomManager from '../../classes/manager/room.manager.js';
import { createResponse } from '../../utils/create.response.js';
import { handleError } from '../../utils/handle.error.js';

export const roomListHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;

  try {
    const result = await roomManager.getRoomList(sessionId);

    const packet = createResponse(result, MESSAGE_TYPE.ROOM_LIST_RESPONSE, sessionId);
    socket.write(packet);
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.ROOM_LIST_RESPONSE, sessionId, error);
  }
};
