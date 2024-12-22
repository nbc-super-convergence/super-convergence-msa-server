import { MESSAGE_TYPE } from '../../utils/constants.js';
import { createResponse } from '../../utils/create.response.js';
import roomManager from '../../classes/manager/room.manager.js';
import { handleError } from '../../utils/handle.error.js';

export const createRoomRequestHandler = async ({ socket, payload }) => {
  const { sessionId, roomName } = payload;

  try {
    const result = await roomManager.createRoom(sessionId, roomName);

    const packet = createResponse(result, MESSAGE_TYPE.CREATE_ROOM_RESPONSE, sessionId);
    socket.write(packet);
  } catch (error) {
    handleError(socket, MESSAGE_TYPE.CREATE_ROOM_RESPONSE, sessionId, error);
  }
};
