import { MESSAGE_TYPE } from '@repo/common/header';
import { loadProtos } from '@repo/common/load.protos';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import net from 'net';
import { config } from '@repo/common/config';
import { redisUtil } from '../src/utils/redis.init.js';

const clientRedisUtil = redisUtil;

const users = ['rider1', 'rider2', 'rider3', 'rider4'];

const board = {
  boardId: 'testBoardId',
  roomId: 'sample',
  ownerId: 'rider1',
  state: 'start',
  users: JSON.stringify(users),
};

await clientRedisUtil.transaction.createBoardGame(board);

const gateOptions = {
  host: 'localhost',
  port: '7011',
};

/**
 * 미니게임 시작 요청, 미니게임 정해서 해당 미니게임 채널에 publish
 * Channel : bomb - test
 * Message : {boardId}
 * @param {String} sessionId 방장 sessionId
 */
// async startMiniGameRequest(sessionId) {
try {
  const message = 'testBoardId';

  // BOMB 채널 고정
  let channel = redisUtil.channel.BOMB;

  await redisUtil.client.publish(channel, message, (err, reply) => {
    if (err) {
      console.error(err);
    } else {
      console.error(reply);
    }
  });

  console.log(
    `[ BOARD : startMiniGameRequest ] : [${channel}] Channel Notification Sent: [${message}]`,
  );
} catch (e) {
  console.error(e);
}
// }

const client = net.connect(gateOptions, async () => {
  await loadProtos();

  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const packet = { sessionId: users[i] };
      const messageType = MESSAGE_TYPE.BOMB_GAME_READY_REQUEST;

      const sequence = 0;

      const gamePacket = serialize(messageType, packet, sequence);

      client.buffer = Buffer.alloc(0);

      client.write(gamePacket);
    }, i * 600);
  }

  client.on('data', (data) => {
    client.buffer = Buffer.concat([client.buffer, data]);
    console.log(' [ _onData ]  data ', data);

    while (client.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(client.buffer);
      console.log(
        `\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (client.buffer.length >= length) {
        const packet = client.buffer.subarray(offset, length);
        client.buffer = client.buffer.subarray(length);

        const payload = packetParser(messageType, packet);

        console.log(' [ BombServer _onData ] payload ====>> ', payload);

        // moveInterval(client, payload);
      } else {
        break;
      }
    }
  });
});

// const moveInterval = (client, payload) => {
//   setInterval(() => {
//     const messageType = MESSAGE_TYPE.BOMB_PLAYER_SYNC_REQUEST;

//     const sequence = 1;
//     const position = {
//       x: payload.position.x + Math.random() * 4 - 2,
//       y: payload.position.y + Math.random() * 4 - 2,
//       z: payload.position.z + Math.random() * 4 - 2,
//     };
//     const force = {
//       x: payload.force.x + Math.random() * 4 - 2,
//       y: payload.force.y + Math.random() * 4 - 2,
//       z: payload.force.z + Math.random() * 4 - 2,
//     };

//     const rotation = -135;

//     const state = 1;

//     const message = {
//       playerId: payload.playerId,
//       position,
//       force,
//       rotation,
//       state,
//     };

//     const packet = serialize(messageType, message, sequence);

//     client.write(packet);
//   }, 3000);
// };
