import { logger } from '@repo/common/config';
import { MESSAGE_TYPE } from '../utils/constants.js';
import { serializeForGate } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '@repo/common/handlers';

export const createNotification = (data, messageType, sessionIds) => {
  let notification = {
    type: messageType,
    payload: {},
  };

  switch (messageType) {
    case MESSAGE_TYPE.JOIN_ROOM_NOTIFICATION:
      notification.payload = {
        userData: data.userData,
      };
      break;

    case MESSAGE_TYPE.LEAVE_ROOM_NOTIFICATION:
      notification.payload = {
        userData: data.userData,
      };
      break;

    case MESSAGE_TYPE.GAME_PREPARE_NOTIFICATION:
      notification.payload = {
        userData: data.userData,
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

  return serializeForGate(
    messageType,
    notification,
    0,
    getPayloadNameByMessageType(messageType),
    sessionIds,
  );
};
