import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';
import iceGameManager from '../managers/ice.game.manager.js';
import { iceConfig } from '../../config/config.js';
import { redisUtil, subRedisClient } from '../../utils/init/redis.js';
import { logger } from '../../utils/logger.utils.js';

class IceServer extends TcpServer {
  constructor(name, host, port, types = []) {
    super(name, host, port, types);

    this.subScriber = subRedisClient;

    this.subScriber.subscribe(iceConfig.REDIS.CHANNEL, 'iceGameChannel', (err, count) => {
      if (err) {
        logger.error(`[Sbuscribe error] ==> `, err);
        return;
      }
      logger.info(`[Subscribed to ${count} channel(s).]`);
    });

    this.subScriber.on('message', async (channel, message) => {
      logger.info(`[Received ${iceConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);

      if (channel === iceConfig.REDIS.CHANNEL) {
        //* `${boardId}:${users}`
        const [boardId, users] = message.split(':');

        await iceGameManager.addGame(boardId, JSON.parse(users));
      } else {
        console.log(`[iceChannel - message]`, message);
        const game = await iceGameManager.getGameBySessionId(message);
        console.log(`[iceChannel - game]`, game);

        for (let user of game.users) {
          console.log(`[iceChannel - user]`, user);
          console.log(`[iceChannel - sessionId]`, user.sessionId);
          await redisUtil.createUserLocation(user.sessionId, 'ice', game.id);
        }

        const buffer = await iceGameManager.iceMiniGameReadyNoti(game);

        // TODO: 나중에 수정하기
        const seq = '2';

        this._socketMap[seq].socket.write(buffer);
      }
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
        try {
          const packet = socket.buffer.subarray(offset, length);
          socket.buffer = socket.buffer.subarray(length);

          const payload = packetParser(messageType, packet);

          const handler = getHandlerByMessageType(messageType);

          await handler({ socket, payload });

          console.log(' [ IceServer _onData ] payload ====>> ', payload);
        } catch (error) {
          logger.error('[ Ice: _onData ] ERROR ====>> ', error);
        }
      } else {
        break;
      }
    }
  };
}
export default IceServer;
