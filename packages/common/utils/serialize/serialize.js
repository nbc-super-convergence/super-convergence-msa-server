import { config } from '../../config/config.js';
import { getPayloadNameByMessageType } from '../../handlers/index.js'; // handlers/index.js
import { getProtoMessages } from '../../init/load.protos.js';

export const serialize = (
  messageType,
  data,
  sequence,
  payloadType = getPayloadNameByMessageType(messageType),
) => {
  const messageTypeBuffer = Buffer.alloc(config.PACKET.MESSAGE_TYPE_LENGTH);
  messageTypeBuffer.writeUintBE(messageType, 0, config.PACKET.MESSAGE_TYPE_LENGTH);

  const version = config.CLIENT.VERSION;
  const versionBuffer = Buffer.from(version);
  const versionLengthBuffer = Buffer.alloc(config.PACKET.VERSION_LENGTH);
  versionLengthBuffer.writeUintBE(versionBuffer.length, 0, config.PACKET.VERSION_LENGTH);

  const sequenceBuffer = Buffer.alloc(config.PACKET.SEQUENCE_LENGTH);
  sequenceBuffer.writeUintBE(sequence, 0, config.PACKET.SEQUENCE_LENGTH);

  const protoMessages = getProtoMessages();

  const gamePacket = protoMessages.game.GamePacket;
  const payload = { [payloadType]: data };

  console.log('  [ serialize ] payload ===>>> ', payload);

  const payloadBuffer = gamePacket.encode(payload).finish();

  const payloadLengthBuffer = Buffer.alloc(config.PACKET.PAYLOAD_LENGTH);
  payloadLengthBuffer.writeUintBE(payloadBuffer.length, 0, config.PACKET.PAYLOAD_LENGTH);

  return Buffer.concat([
    messageTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};

/**
 * * 서비스서버에서 게이트서버로 전송할 때,
 * @param {Number} messageType
 * @param {Object} data
 * @param {Number} sequence
 * @param {Number} payloadType
 * @param {Array} sessionIds
 * @returns
 */
export const serializeForGate = (
  messageType,
  data,
  sequence,
  payloadType = getPayloadNameByMessageType(messageType),
  sessionIds,
) => {
  const messageTypeBuffer = Buffer.alloc(config.PACKET.MESSAGE_TYPE_LENGTH);
  messageTypeBuffer.writeUintBE(messageType, 0, config.PACKET.MESSAGE_TYPE_LENGTH);

  const version = config.CLIENT.VERSION;
  const versionBuffer = Buffer.from(version);
  const versionLengthBuffer = Buffer.alloc(config.PACKET.VERSION_LENGTH);
  versionLengthBuffer.writeUintBE(versionBuffer.length, 0, config.PACKET.VERSION_LENGTH);

  const sequenceBuffer = Buffer.alloc(config.PACKET.SEQUENCE_LENGTH);
  sequenceBuffer.writeUintBE(sequence, 0, config.PACKET.SEQUENCE_LENGTH);

  const protoMessages = getProtoMessages();

  const gamePacket = protoMessages.game.GamePacket;
  const payload = { [payloadType]: data };

  console.log('  [ serializeForGate ] payload ===>>> ', payload);

  const payloadBuffer = gamePacket.encode(payload).finish();

  const gatePacket = protoMessages.gate.GatePacket;
  const gatePayload = {
    sessionIds,
    gamePacket: payloadBuffer,
  };
  console.log('  [ serializeForGate ] gatePayload ===>>> ', gatePayload);
  const gatePayloadBuffer = gatePacket.encode(gatePayload).finish();

  const payloadLengthBuffer = Buffer.alloc(config.PACKET.PAYLOAD_LENGTH);
  payloadLengthBuffer.writeUintBE(gatePayloadBuffer.length, 0, config.PACKET.PAYLOAD_LENGTH);

  return Buffer.concat([
    messageTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    gatePayloadBuffer,
  ]);
};
