import { config } from '../../config/config.js';
import { getProtoMessages } from '../../init/load.protos.js';

const { PACKET, FIELD_NAME, CLIENT } = config;

/**
 * * 직렬화 함수
 * @param {Number} messageType
 * @param {Object} data
 * @param {Number} sequence
 * @returns {Buffer}
 */
export const serialize = (messageType, data, sequence) => {
  const version = CLIENT.VERSION;
  const versionBuffer = Buffer.from(version, 'utf-8'); //* 버전 문자열을 버퍼로 변환
  const versionLength = versionBuffer.length;
  const buffer = Buffer.alloc(PACKET.TOTAL_LENGTH + versionLength);
  let offset = 0;

  console.log('Encoding data:', data);

  //* messageType 쓰기
  buffer.writeUInt16BE(messageType, offset);
  offset += PACKET.MESSAGE_TYPE_LENGTH;

  //* version 길이 쓰기
  buffer.writeUInt8(versionLength, offset);
  offset += PACKET.VERSION_LENGTH;

  //* version 쓰기)
  versionBuffer.copy(buffer, offset);
  offset += versionLength;

  //* sequence 쓰기
  buffer.writeUInt32BE(sequence, offset);
  offset += PACKET.SEQUENCE_LENGTH;

  //* data 메시지 타입에 맞게 쓰기
  const protoMessages = getProtoMessages();
  const gameMessage = protoMessages.game.GamePacket;

  const field = FIELD_NAME[messageType];
  console.log('field name:', field);

  const payload = gameMessage.encode({ [field]: data }).finish();
  const payloadLength = payload.length;

  console.log('  [ serialize ] payload ===>>> ', payload);

  //* payload 길이 쓰기
  buffer.writeUInt32BE(payloadLength, offset);
  offset += PACKET.PAYLOAD_LENGTH;

  const result = Buffer.concat([buffer, payload]);
  offset += payloadLength;

  return result;
};

/**
 * * 서비스서버에서 게이트서버로 전송할 때,
 * @param {Number} messageType
 * @param {Object} data
 * @param {Number} sequence
 * @param {Array} sessionIds
 * @returns {Buffer}
 */
export const serializeForGate = (messageType, data, sequence, sessionIds) => {
  const version = CLIENT.VERSION;
  const versionBuffer = Buffer.from(version, 'utf-8'); //* 버전 문자열을 버퍼로 변환
  const versionLength = versionBuffer.length;
  const buffer = Buffer.alloc(PACKET.TOTAL_LENGTH + versionLength);
  let offset = 0;

  console.log('Encoding data:', data);

  //* messageType 쓰기
  buffer.writeUInt16BE(messageType, offset);
  offset += PACKET.MESSAGE_TYPE_LENGTH;

  //* version 길이 쓰기
  buffer.writeUInt8(versionLength, offset);
  offset += PACKET.VERSION_LENGTH;

  //* version 쓰기)
  versionBuffer.copy(buffer, offset);
  offset += versionLength;

  //* sequence 쓰기
  buffer.writeUInt32BE(sequence, offset);
  offset += PACKET.SEQUENCE_LENGTH;

  //* data 메시지 타입에 맞게 쓰기
  const protoMessages = getProtoMessages();
  const gameMessage = protoMessages.game.GamePacket;

  const field = FIELD_NAME[messageType];
  console.log('  [ serializeForGate ] field name ===>>>', field);
  console.log('  [ serializeForGate ] data ===>>>:', data);

  const payload = gameMessage.encode({ [field]: data }).finish();

  console.log('  [ serializeForGate ] payload ===>>> ', payload);

  //* gate패킷으로 다시 쓰기
  const gateMessage = protoMessages.gate.GatePacket;
  const gatePacket = {
    sessionIds,
    gamePacket: payload,
  };

  console.log('gatePacket', gatePacket);
  const gatePayload = gateMessage.encode(gatePacket).finish();
  const payloadLength = gatePayload.length;

  //* payload 길이 쓰기
  buffer.writeUInt32BE(payloadLength, offset);
  offset += PACKET.PAYLOAD_LENGTH;

  const result = Buffer.concat([buffer, gatePayload]);
  offset += payloadLength;

  return result;
};

/**
 * * 게이트에서 클라이언트로 보내기 전 직렬화
 * @param {Number} messageType
 * @param {Number} sequence
 * @param {Buffer} gamePacketBuffer
 * @returns {Buffer}
 */
export const serializeForClient = (messageType, sequence, gamePacketBuffer) => {
  const version = CLIENT.VERSION;
  const versionBuffer = Buffer.from(version, 'utf-8'); //* 버전 문자열을 버퍼로 변환
  const versionLength = versionBuffer.length;
  const buffer = Buffer.alloc(PACKET.TOTAL_LENGTH + versionLength);
  let offset = 0;

  //* messageType 쓰기
  buffer.writeUInt16BE(messageType, offset);
  offset += PACKET.MESSAGE_TYPE_LENGTH;

  //* version 길이 쓰기
  buffer.writeUInt8(versionLength, offset);
  offset += PACKET.VERSION_LENGTH;

  //* version 쓰기)
  versionBuffer.copy(buffer, offset);
  offset += versionLength;

  //* sequence 쓰기
  buffer.writeUInt32BE(sequence, offset);
  offset += PACKET.SEQUENCE_LENGTH;

  //* payload 길이 쓰기
  buffer.writeUInt32BE(gamePacketBuffer.length, offset);
  offset += PACKET.PAYLOAD_LENGTH;

  const result = Buffer.concat([buffer, gamePacketBuffer]);

  return result;
};
