import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';
import iceGameManager from '../managers/ice.game.manager.js';
import { iceConfig } from '../../config/config.js';
import { subRedisClient } from '../../utils/init/redis.js';

class IceServer extends TcpServer {
  constructor(name, port, types = []) {
    super(name, port, types);

    this.subScriber = subRedisClient;

    this.subScriber.subscribe(iceConfig.REDIS.CHANNEL, (err, count) => {
      if (err) {
        console.error('Subscribe error:', err);
        return;
      }
      console.log(`Subscribed to ${count} channel(s).`);
    });

    this.subScriber.on('message', async (channel, message) => {
      console.info(`[Received ${iceConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);

      //* `${boardId}:${users}`
      const [boardId, users] = message.split(':');

      await iceGameManager.addGame(boardId, users.split(','));
    });

    this.subScriber.on('iceGameChannel', async (channel, message) => {
      const { boardId } = message;

      const game = await iceGameManager.getGameBySessionId(boardId);

      const buffer = await iceGameManager.iceMiniGameReadyNoti(game);

      // TODO: 나중에 수정하기
      const seq = '2';

      this._socketMap[seq].socket.write(buffer);
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
