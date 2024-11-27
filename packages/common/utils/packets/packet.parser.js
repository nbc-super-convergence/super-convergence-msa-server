import { getPayloadNameByMessageType } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/load.protos.js';

export const packetParser = (
  messageType,
  data,
  payloadType = getPayloadNameByMessageType(messageType),
) => {
  let payload;
  try {
    const protoMessages = getProtoMessages();
    const gamePacket = protoMessages.game.GamePacket;
    const decodedGamePacket = gamePacket.decode(data);
    console.log('[ packetParser ] decodedGamePacket ===>> ', decodedGamePacket);
    const field = decodedGamePacket[payloadType];
    payload = { ...field };
  } catch (e) {
    console.error('[ packetParser ] ===> ', e);
  }

  return payload;
};

/**
 * gate용 packetParser
 * @param {*} messageType
 * @param {*} data
 * @param {*} payloadType
 * @returns
 */
export const packetParserForGate = (
  messageType,
  data,
  payloadType = getPayloadNameByMessageType(messageType),
) => {
  let payload;
  try {
    const protoMessages = getProtoMessages();
    const gatePacket = protoMessages.gate.GatePacket;
    const decodedGatePacket = gatePacket.decode(data);
    console.log('[ packetParserForGate ] decodedGatePacket  ===>>> \n', decodedGatePacket);

    const gamePacket = protoMessages.game.GamePacket;
    const decodedGamePacket = gamePacket.decode(decodedGatePacket.gamePacket);
    const field = decodedGamePacket[payloadType];
    payload = { ...field };
    console.log('[ packetParserForGate ] field - payload  ===>>> \n', payload);

    payload = { ...decodedGatePacket };
    console.log('[ packetParserForGate ] gatePacketField - payload  ===>>> \n', payload);
  } catch (e) {
    console.error('[ packetParserForGate ] ===> ', e);
  }

  return payload;
};
