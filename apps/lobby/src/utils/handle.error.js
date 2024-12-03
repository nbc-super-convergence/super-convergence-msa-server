import { serializeForGate } from '@repo/common/utils';
import { config } from '@repo/common/config';
import { logger } from './logger.utils.js';

export const handleError = (socket, messageType, sessionId, error) => {
  logger.error(`[ ${messageType} ] ====>  error `, {
    errorName: error.name,
    error: error.message,
    stack: error.stack,
  });

  socket.write(
    serializeForGate(messageType, { success: false, failCode: config.FAIL_CODE.UNKNOWN_ERROR }, 0, [
      sessionId,
    ]),
  );
};
