import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { logger } from '../../utils/logger.utils.js';
import { redisUtil, subRedisClient } from '../../utils/redis.init.js';
import { bombConfig } from '../../config/config.js';
import BombGameManager from '../managers/bomb.game.manager.js';

class BombServer extends TcpServer {
  constructor(name, host, port, types = []) {
    super(name, host, port, types);

    this.subScriber = subRedisClient;

    this.subScriber.subscribe(bombConfig.REDIS.CHANNEL, 'bombGameChannel', (err, count) => {
      if (err) {
        logger.error(`[Sbuscribe error] ==> `, err);
        return;
      }
      logger.info(`[Subscribed to ${count} channel(s).]`);
    });

    this.subScriber.on('message', async (channel, message) => {
      logger.info(`[Received ${bombConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);

      if (channel === bombConfig.REDIS.CHANNEL) {
        //* `${boardId}:${users}`
        const [boardId, users] = message.split(':');

        logger.info('BombGameManager', BombGameManager);

        await BombGameManager.addGame(boardId, JSON.parse(users));
      } else {
        logger.info(`[bombChannel - message]`, message);
        const game = await BombGameManager.getGameBySessionId(message);
        logger.info(`[bombChannel - game]`, game);

        for (let user of game.users) {
          logger.info(`[bombChannel - user]`, user);
          logger.info(`[bombChannel - sessionId]`, user.sessionId);
          await redisUtil.createUserLocation(user.sessionId, 'bomb', game.id);
        }

        const buffer = await BombGameManager.bombMiniGameReadyNoti(game);

        // TODO: 나중에 수정하기
        const seq = '2';

        this._socketMap[seq].socket.write(buffer);
      }
    });
  }

  _onData = (socket) => async (data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);
    logger.info(' [ _onData ]  data ', data);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
      logger.info(
        `\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (socket.buffer.length >= length) {
        try {
          const packet = socket.buffer.subarray(offset, length);
          socket.buffer = socket.buffer.subarray(length);

          const payload = packetParser(messageType, packet);

          const handler = getHandlerByMessageType(messageType);

          await handler({ socket, payload });

          logger.info(' [ BombServer _onData ] payload ====>> ', payload);
        } catch (error) {
          logger.error('[ BombServer: _onData ] ERROR ====>> ', error);
        }
      } else {
        break;
      }
    }
  };
}
export default BombServer;
