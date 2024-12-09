import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { logger } from '../../utils/logger.utils.js';
import { danceConfig } from '../../config/config.js';
import { subRedisClient } from '../../init/redis.js';

class DanceServer extends TcpServer {
  constructor(name, port, types = []) {
    super(name, port, types);

    this.subScriber = subRedisClient;

    this.subScriber.subscribe(danceConfig.REDIS.CHANNEL, 'danceGameChannel', (err, count) => {
      if (err) {
        logger.error(`[Subscribe error] ==> `, err);
        return;
      }
      logger.info(`[Subscribed to ${count} channel(s).]`);
    });

    // this.subScriber.on('message', async (channel, message) => {
    // logger.info(`[Received ${danceConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);
    // if (channel === danceConfig.REDIS.CHANNEL) {
    //   //* `${boardId}:${users}`
    //   const [boardId, users] = message.split(':');
    //   await iceGameManager.addGame(boardId, JSON.parse(users));
    // } else {
    //   console.log(`[iceChannel - message]`, message);
    //   const game = await iceGameManager.getGameBySessionId(message);
    //   console.log(`[iceChannel - game]`, game);
    //   for (let user of game.users) {
    //     console.log(`[iceChannel - user]`, user);
    //     console.log(`[iceChannel - sessionId]`, user.sessionId);
    //     await redisUtil.createUserLocation(user.sessionId, 'ice', game.id);
    //   }
    //   const buffer = await iceGameManager.iceMiniGameReadyNoti(game);
    //   // TODO: 나중에 수정하기
    //   const seq = '2';
    //   this._socketMap[seq].socket.write(buffer);
    // }
    // });
  }

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
          console.log(' [ Dance_onData ] payload ====>> ', payload);

          const handler = getHandlerByMessageType(messageType);
          if (!handler) {
            logger.error(`[ Dance_onData ] No handler found for messageType: ${messageType}`);
            continue;
          }

          await handler({ socket, payload });

          //* 처리된 패킷 제거
          socket.buffer = socket.buffer.subarray(length);
        } catch (packetError) {
          logger.error('[ Dance_onData ] Packet processing error:', {
            error: packetError,
          });
        }
      }
    } catch (error) {
      logger.error('[ Dance_onData ] ====>> critical error', { error });

      //* 버퍼 초기화
      socket.buffer = Buffer.alloc(0);
    }
  };
}

export default DanceServer;
