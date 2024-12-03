import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { deserialize, packetParser } from '@repo/common/utils';
import { logger } from '../../utils/logger.utils.js';

class LobbyServer extends TcpServer {
  _onData = (socket) => async (data) => {
    try {
      socket.buffer = Buffer.concat([socket.buffer, data]);

      while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
        try {
          //* 역직렬화
          const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
          logger.info(
            `\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
          );

          //* 길이 체크
          if (socket.buffer.length < length) {
            break;
          }

          //* 패킷 파싱
          const packet = socket.buffer.subarray(offset, length);
          const payload = packetParser(messageType, packet);
          console.log(' [ Lobby_onData ] payload ====>> ', payload);

          const handler = getHandlerByMessageType(messageType);
          if (!handler) {
            logger.error(`[ Lobby_onData ] No handler found for messageType: ${messageType}`);
            continue;
          }

          await handler({ socket, payload });

          //* 처리된 패킷 제거
          socket.buffer = socket.buffer.subarray(length);
        } catch (packetError) {
          logger.error('[ Lobby_onData ] Packet processing error:', {
            error: packetError,
          });
        }
      }
    } catch (error) {
      logger.error('[ Lobby_onData ] ====>> critical error', { error });

      //* 버퍼 초기화
      socket.buffer = Buffer.alloc(0);
    }
  };
}

export default LobbyServer;
