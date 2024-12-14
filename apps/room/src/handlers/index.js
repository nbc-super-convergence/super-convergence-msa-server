import { MESSAGE_TYPE } from '../utils/constants.js';
import { logger } from '../utils/logger.utils.js';
import { createRoomRequestHandler } from './room/create.room.handler.js';
import { roomListRequestHandler } from './room/room.list.handler.js';
import { joinRoomRequestHandler } from './room/join.room.handler.js';
import { leaveRoomRequestHandler } from './room/leave.room.handler.js';
import { gamePrepareRequestHandler } from './room/game.prepare.handler.js';
import { roomKickRequestHandler } from './room/room.kick.handler.js';

const handlers = {
  // * room
  [MESSAGE_TYPE.ROOM_LIST_REQUEST]: { handler: roomListRequestHandler },
  [MESSAGE_TYPE.CREATE_ROOM_REQUEST]: { handler: createRoomRequestHandler },
  [MESSAGE_TYPE.JOIN_ROOM_REQUEST]: { handler: joinRoomRequestHandler },
  [MESSAGE_TYPE.LEAVE_ROOM_REQUEST]: { handler: leaveRoomRequestHandler },
  [MESSAGE_TYPE.GAME_PREPARE_REQUEST]: { handler: gamePrepareRequestHandler },
  [MESSAGE_TYPE.ROOM_KICK_REQUEST]: { handler: roomKickRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    logger.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
