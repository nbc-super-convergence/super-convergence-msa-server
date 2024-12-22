import { FAIL_CODE } from '@repo/common/failcodes';
import { serializeForGate } from '@repo/common/utils';
import { logger } from '../logger.utils.js';

export const handleError = (socket, messageType, sessionIds, error) => {
  //
  logger.error(`[ handleError ] messageType : ${messageType}, ERROR ===>> `, error);

  socket.write(
    serializeForGate(
      messageType,
      { success: false, failCode: FAIL_CODE.UNKNOWN_ERROR },
      0,
      sessionIds,
    ),
  );
};
