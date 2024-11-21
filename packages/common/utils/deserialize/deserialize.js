import { config } from "../../config/config.js";

export const deserialize = (buffer) => {
  const messageType = buffer.readUintBE(0, config.PACKET.MESSAGE_TYPE_LENGTH);

  const versionLength = buffer.readUintBE(
    config.PACKET.MESSAGE_TYPE_LENGTH,
    config.PACKET.VERSION_LENGTH
  );

  let offset = config.PACKET.MESSAGE_TYPE_LENGTH + config.PACKET.VERSION_LENGTH;

  const version = buffer.subarray(offset, offset + versionLength).toString();
  offset += versionLength;

  const sequence = buffer.readUintBE(offset, config.PACKET.SEQUENCE_LENGTH);
  offset += config.PACKET.SEQUENCE_LENGTH;

  const payloadLength = buffer.readUintBE(offset, config.PACKET.PAYLOAD_LENGTH);
  offset += config.PACKET.PAYLOAD_LENGTH;

  return {
    messageType,
    version,
    sequence,
    offset,
    length: offset + payloadLength,
  };
};
