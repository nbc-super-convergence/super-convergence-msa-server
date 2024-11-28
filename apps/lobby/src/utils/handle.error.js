import { getPayloadNameByMessageType } from '../handlers/index.js';
import { serializeForGate } from '@repo/common/utils';
import { config, logger } from '@repo/common/config';

export const handleError = (socket, messageType, sessionId, error) => {
  logger.error(`[ ${messageType} ] ====>  error `, {
    errorName: error.name,
    error: error.message,
    stack: error.stack,
  });

  socket.write(
    serializeForGate(
      messageType,
      { success: false, failCode: config.FAIL_CODE.UNKNOWN_ERROR },
      0,
      getPayloadNameByMessageType(messageType),
      [sessionId],
    ),
  );
};
