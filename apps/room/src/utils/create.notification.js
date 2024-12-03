import { logger } from './logger.utils.js';
import { MESSAGE_TYPE } from '../utils/constants.js';
import { serializeForGate } from '@repo/common/utils';

export const createNotification = (data, messageType, sessionIds) => {
  let notification = {};

  switch (messageType) {
    case MESSAGE_TYPE.JOIN_ROOM_NOTIFICATION:
      notification = {
        room: data.room,
      };
      break;

    case MESSAGE_TYPE.LEAVE_ROOM_NOTIFICATION:
      notification = {
        room: data.room,
      };
      break;

    case MESSAGE_TYPE.GAME_PREPARE_NOTIFICATION:
      notification = {
        user: data.userData,
        isReady: data.isReady,
        state: data.state,
      };
      break;

    default:
      break;
  }

  logger.info('[ createNotification ] ====> result', {
    messageType,
    sessionIds,
    ...data,
  });

  return serializeForGate(messageType, notification, 0, sessionIds);
};
