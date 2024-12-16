import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { deserialize, packetParser } from '@repo/common/utils';
import { logger } from '../../utils/logger.utils.js';
import { subRedisClient, redis } from '../../utils/redis.js';
import boardManager from '../managers/board.manager.class.js';

/**
 * 보드게임 서버
 *
 */
class BoardServer extends TcpServer {
  constructor(name, host, port, types) {
    super(name, host, port, types);

    // * 보드 골드 싱크 채널 구독
    this.subScriber = subRedisClient;

    this.subScriber.subscribe(redis.channel.BOARD_GOLD, (err, count) => {
      if (err) {
        logger.error(`[ BOARD: Sbuscribe error] ==> `, err);
        return;
      }
      logger.info(`[BOARD: Subscribed to ${count} channel(s).]`);
    });

    // * 메세지
    this.subScriber.on('message', async (channel, message) => {
      //
      let buffer;
      if (channel === redis.channel.BOARD_GOLD) {
        // message : ${boardId}

        const boardId = message;

        buffer = await boardManager.makeBoardPlayersGoldSyncNoti(boardId);

        // TODO: 나중에 수정하기 (2 : Gate 서버)
        const seq = '2';
        this._socketMap[seq].socket.write(buffer);
      }
    });
  }

  // * _onData() Overriding
  _onData = (socket) => async (data) => {
    //
    socket.buffer = Buffer.concat([socket.buffer, data]);
    logger.info(' [ BoardServer _onData ]  data ', data);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
      logger.info(
        `[ BOARD: _onData ] ==>>>\nmessageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (socket.buffer.length >= length) {
        try {
          const packet = socket.buffer.subarray(offset, length);
          socket.buffer = socket.buffer.subarray(length);

          const payload = packetParser(messageType, packet);

          logger.info(' [ onData ] payload ===>> ', payload);

          const handler = getHandlerByMessageType(messageType);

          await handler({ socket, payload });

          logger.info(' [ BoardServer _onData ] payload ====>> ', payload);
        } catch (e) {
          logger.error('[ BOARD: _onData ] ERROR ====>> ', e);
        }
      } else {
        break;
      }
    }
  };
}

export default BoardServer;
