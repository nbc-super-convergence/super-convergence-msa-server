import { MESSAGE_TYPE } from '@repo/common/header';
import { loadProtos } from '@repo/common/load.protos';
import { serialize } from '@repo/common/utils';
import net from 'net';

const gateOptions = {
  host: 'localhost',
  port: '5555',
};
const client = net.connect(gateOptions, async () => {
  await loadProtos();
  const packet = {};
  const messageType = MESSAGE_TYPE.ICE_JOIN_REQUEST;

  const sequence = 0;

  const gamePacket = serialize(messageType, packet, sequence);

  client.write(gamePacket);

  client.on('data', (data) => {
    console.log(`클라이언트에서 받은 데이터`, data);
  });
});
