import { MESSAGE_TYPE } from '@repo/common/header';
import { loadProtos } from '@repo/common/load.protos';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import net from 'net';
import { getPayloadNameByMessageType } from '../src/handlers/index.js';
import { config } from '@repo/common/config';

const gateOptions = {
  host: 'localhost',
  port: '7011',
};
const client = net.connect(gateOptions, async () => {
  await loadProtos();
  const packet = {};
  const messageType = MESSAGE_TYPE.ICE_JOIN_REQUEST;

  const sequence = 0;

  const payloadType = getPayloadNameByMessageType(messageType);
  const gamePacket = serialize(messageType, packet, sequence, payloadType);

  client.buffer = Buffer.alloc(0);

  client.write(gamePacket);

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

        const payloadType = getPayloadNameByMessageType(messageType);
        const payload = packetParser(messageType, packet, payloadType);

        console.log(' [ IceServer _onData ] payload ====>> ', payload);

        moveInterval(client, payload);
      } else {
        break;
      }
    }
  });
});

const moveInterval = (client, payload) => {
  setInterval(() => {
    const messageType = MESSAGE_TYPE.ICE_PLAYER_MOVE_REQUEST;

    const sequence = 1;
    const position = {
      x: payload.position.x + Math.random() * 4 - 2,
      y: payload.position.y + Math.random() * 4 - 2,
      z: payload.position.z + Math.random() * 4 - 2,
    };
    const force = {
      x: payload.force.x + Math.random() * 4 - 2,
      y: payload.force.y + Math.random() * 4 - 2,
      z: payload.force.z + Math.random() * 4 - 2,
    };

    const rotation = -135;

    const state = 1;

    const message = {
      playerId: payload.playerId,
      position,
      force,
      rotation,
      state,
    };

    const payloadType = getPayloadNameByMessageType(messageType);

    const packet = serialize(messageType, message, sequence, payloadType);

    client.write(packet);
  }, 3000);
};
