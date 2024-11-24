import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { deserialize, packetParser } from '@repo/common/utils';

class LobbyServer extends TcpServer {
  _onData = (socket) => async (data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);
    console.log(' [ _onData ]  data ', data);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
      console.log(
        `\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (socket.buffer.length >= length) {
        const packet = socket.buffer.subarray(offset, length);
        socket.buffer = socket.buffer.subarray(length);

        const payload = packetParser(messageType, packet);
        console.log(' [ Lobby_onData ] payload ====>> ', payload);

        const handler = getHandlerByMessageType(payload);
        await handler({ socket, messageType, payload });
      } else {
        break;
      }
    }
  };
}

export default LobbyServer;
