import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { deserialize, packetParser } from '@repo/common/utils';
import { getHandlerByMessageType } from '../../handlers/index.js';
import { logger } from '../../utils/logger.utils.js';
import { danceConfig } from '../../config/config.js';
import { redis, subRedisClient } from '../../init/redis.js';
import danceGameManager from '../manager/dance.manager.js';

class DanceServer extends TcpServer {
  constructor(name, host, port, types = []) {
    super(name, host, port, types);

    this.subScriber = subRedisClient;

    this.subScriber.subscribe(danceConfig.REDIS.CHANNEL, 'danceGameChannel', (err, count) => {
      if (err) {
        logger.error(`[DanceServer Subscribe error] ==> `, err);
        return;
      }
      logger.info(`[DanceServer Subscribed to ${count} channel(s).]`);
    });

    this.subScriber.on('message', async (channel, message) => {
      logger.info(`[Received ${danceConfig.REDIS.CHANNEL}] ===> ${channel}: ${message}`);

      if (channel === danceConfig.REDIS.CHANNEL) {
        //* `${boardId}:${users}`
        const [boardId, users] = message.split(':');

        await danceGameManager.createGame(boardId, JSON.parse(users));
      } else {
        try {
          logger.info(`[DanceChannel - message]`, message);

          //* message가 아마 boardId?
          const game = danceGameManager.getGameByGameId(message);

          logger.info(`[DanceChannel - game]`, game);

          for (const user of Array.from(game.users.keys())) {
            logger.info(`[DanceChannel - sessionId]`, user);
            await redis.createUserLocation(user, 'dance', game.id);
          }

          const buffer = danceGameManager.miniGameReadyNoti(game);

          // TODO: 나중에 수정하기
          const seq = '2';

          logger.info('[ DANCE: this._socketMap ] ====>>> ', this._socketMap);

          this._socketMap[seq].socket.write(buffer);
        } catch (error) {
          logger.error(`[DanceChannel] ====> error`, error);
        }
      }
    });
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
