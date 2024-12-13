import { TcpServer } from '@repo/common/classes';
import { redisUtil, subRedisClient } from '../../utils/init/redis.js';
import { dartConfig } from '../../config/dart.config.js';
import { logger } from '../../utils/logger.utils.js';
import DartGameManager from '../manager/dart.game.manager.class.js';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';

class DartServer extends TcpServer {
  constructor(name, host, port, types = []) {
    super(name, host, port, types);

    this.subScriber = subRedisClient;

    this.subScriber.subscribe(dartConfig.REDIS.CHANNEL, 'dartGameChannel', (err, count) => {
      if (err) {
        logger.error(`[Sbuscribe error] ==> `, err);
        return;
      }
      logger.info(`[Subscribed to ${count} channel(s).]`);
    });

    this.subScriber.on('message', async (channel, message) => {
      try {
        if (channel === dartConfig.REDIS.CHANNEL) {
          logger.info(`[Received ${dartConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);

          //* `${boardId}:${users}`
          const [boardId, users] = message.split(':');

          await DartGameManager.addGame(boardId, JSON.parse(users));
        } else {
          logger.info(`[Received ${dartConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);

          const game = await DartGameManager.getGameById(message);
          logger.info(`[dartGameChannel - game]`, game);

          for (let user of game.users) {
            logger.info(`[dartGameChannel - sessionId]`, user.sessionId);
            await redisUtil.createUserLocation(user.sessionId, 'dart', game.id);
          }

          const buffer = await DartGameManager.makeMiniGameReadyNoti(game);

          // TODO: 나중에 수정하기 [ GATE ]
          const seq = '2';

          this._socketMap[seq].socket.write(buffer);
        }
      } catch (error) {
        logger.error(`[subScribe - error] channel:` + error);
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

          console.log(' [ DART: _onData ] payload ====>> ', payload);
        } catch (error) {
          logger.error('[ DART: _onData ] ERROR ====>> ', error);
        }
      } else {
        break;
      }
    }
  };
}

export default DartServer;
