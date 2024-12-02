import { getProtoMessages } from '../../init/load.protos.js';
import { config } from '../../config/config.js';

const { FIELD_NAME } = config;

/**
 * 서비스 packetParser
 * @param {Number} messageType
 * @param {Object} data
 * @returns {Object || null}
 */
export const packetParser = (messageType, data) => {
  try {
    const protoMessages = getProtoMessages();
    const gameMessage = protoMessages.game.GamePacket;
    const decodedGamePacket = gameMessage.decode(data);
    const fieldName = FIELD_NAME[messageType];
    if (!fieldName) {
      console.error('[ packetParser ] Unknown message type ===>>> ', messageType);
      return null;
    }

    console.log('[ packetParser ] decodedGamePacket ===>> ', decodedGamePacket);

    const payload = decodedGamePacket[fieldName];

    console.log('[ packetParser ] payload ===>> ', payload);

    return payload;
  } catch (e) {
    console.error('[ packetParser ] ===> ', e);
    return null;
  }
};

/**
 * gate용 packetParser
 * @param {Number} messageType
 * @param {Object} data
 * @returns {Object || null}
 */
export const packetParserForGate = (messageType, data) => {
  try {
    const protoMessages = getProtoMessages();
    const gateMessage = protoMessages.gate.GatePacket;
    const decodedGatePacket = gateMessage.decode(data);

    console.log('[ packetParserForGate ] decodedGatePacket  ===>>> \n', decodedGatePacket);

    return { ...decodedGatePacket };
  } catch (e) {
    console.error('[ packetParserForGate ] ===> ', e);
    return null;
  }
};
