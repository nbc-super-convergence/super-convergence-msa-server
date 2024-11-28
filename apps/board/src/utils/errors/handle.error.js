import { FAIL_CODE } from '@repo/common/failcodes';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { serializeForGate } from '@repo/common/utils';

export const handleError = (socket, messageType, sessionIds, error) => {
  //
  console.error(`[ handleError ] messageType : ${messageType}, ERROR ===>> `, error);

  socket.write(
    serializeForGate(
      messageType,
      { success: false, failCode: FAIL_CODE.UNKNOWN_ERROR },
      0,
      getPayloadNameByMessageType(messageType),
      sessionIds,
    ),
  );
};
