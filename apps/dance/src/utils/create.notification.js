import { logger } from './logger.utils.js';
import { MESSAGE_TYPE } from './constants.js';
import { serializeForGate } from '@repo/common/utils';

export const createNotification = (data, messageType, sessionIds) => {
  let notification = {};

  switch (messageType) {
    case MESSAGE_TYPE.DANCE_READY_NOTIFICATION:
      notification = {
        sessionId: data,
      };
      break;

    case MESSAGE_TYPE.DANCE_MINI_GAME_READY_NOTIFICATION:
      notification = {
        players: data.map((user) => ({
          sessionId: user.sessionId,
          teamNumber: user.teamNumber,
        })),
      };
      break;

    case MESSAGE_TYPE.DANCE_START_NOTIFICATION:
      notification = {
        startTime: data,
      };
      break;

    case MESSAGE_TYPE.DANCE_TABLE_NOTIFICATION:
      notification = {
        dancePools: data,
      };
      break;

    case MESSAGE_TYPE.DANCE_KEY_PRESS_NOTIFICATION:
      notification = {
        teamNumber: data.teamNumber,
        correct: data.correct,
        state: data.state,
      };
      break;

    case MESSAGE_TYPE.DANCE_GAME_OVER_NOTIFICATION:
      notification = {
        TeamRank: data.TeamRank,
        result: data.result,
        reason: data.reason,
        endTime: data.endTime,
      };
      break;

    case MESSAGE_TYPE.DANCE_CLOSE_SOCKET_NOTIFICATION:
      notification = {
        disconnectedSessionId: data.disconnectedSessionId,
        replacementSessionId: data.replacementSessionId,
      };
      break;

    default:
      break;
  }

  logger.info('[ createNotification ] ====> result', {
    messageType,
    sessionIds,
    ...notification,
  });

  return serializeForGate(messageType, notification, 0, sessionIds);
};
