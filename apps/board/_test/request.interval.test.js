import { TcpClient } from '@repo/common/classes';
import { MESSAGE_TYPE } from '../src/constants/header.js';
import { loadProtos } from '@repo/common/load.protos';
import { getPayloadNameByMessageType } from '../src/handlers/index.js';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { config } from '@repo/common/config';

const client = new TcpClient(
  'localhost',
  7011,
  (options) => {
    console.log(' onCreate ==>> ');
  },
  async (socket, data) => {
    console.log(' [ TEST onData ]  ==>> ', data);
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
      console.log(
        `==>>>\nmessageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (socket.buffer.length >= length) {
        const packet = socket.buffer.subarray(offset, length);
        socket.buffer = socket.buffer.subarray(length);

        const payload = packetParser(messageType, packet, 'rollDiceResponse');

        console.log(' [ TEST onData ] payload ===>> ', payload);
      } else {
        break;
      }
    }
  },
  (options) => {
    console.log(' onEnd ==>> ', options);
  },
  (options, err) => {
    console.log(' onError ==>> ', err);
  },
);

await loadProtos();
console.log('[ TEST ] GAME START REQUEST +++++++++++++++++++ ');
client.connect();
console.log('[ TEST ] CLIENT CONNECTED +++++++++++++++++++ ');

const interval = setInterval(() => {
  const type = MESSAGE_TYPE.GAME_START_REQUEST;
  const random = Math.floor(Math.random() * 10);
  const payload = {
    sessionId: 'RRRR' + random,
  };
  console.log('[ TEST ] payload ===>> ', payload);
  const packet = serialize(type, payload, 2, getPayloadNameByMessageType(type));
  client.write(packet);
  console.log('[ TEST ] client.writed ===>> ', packet);
}, 1000);
