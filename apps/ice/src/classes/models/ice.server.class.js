import { RedisClient, TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { CHANNEL, REDIS } from '../../constants/env.js';
import iceGameManager from '../managers/ice.game.manager.js';

class IceServer extends TcpServer {
  constructor(name, port, types = []) {
    super(name, port, types);

    this.subScriber = new RedisClient(REDIS).getClient();

    this.subScriber.subscribe(CHANNEL, (err, count) => {
      if (err) {
        console.error('Subscribe error:', err);
        return;
      }
      console.log(`Subscribed to ${count} channel(s).`);
    });

    this.subScriber.on('message', async (channel, message) => {
      console.info(`[Received ${CHANNEL}] ===> ${channel}: ${message}`);

      //* `${boardId}:${request}`
      const [boardId, request] = message.split(':');

      await iceGameManager.addGame(boardId);

      const game = iceGameManager.getGameBySessionId(boardId);

      const buffer = await iceGameManager.iceMiniGameReadyNoti(game);

      this._socket.write(buffer);
    });
  }

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

        const handler = getHandlerByMessageType(messageType);

        await handler({ socket, payload });

        console.log(' [ IceServer _onData ] payload ====>> ', payload);
      } else {
        break;
      }
    }
  };
}
export default IceServer;
