import { config } from "../../config/config.js";

function bigEndianToLittleEndian(buffer) {
  const view = new Uint8Array(buffer);
  const reversed = new Uint8Array(buffer.byteLength);

  for (let i = 0; i < view.length; i++) {
    reversed[i] = view[view.length - 1 - i];
  }

  return reversed.buffer;
}

export const deserialize = (buffer) => {
  console.log(" dddd =++>> ", buffer.toString());

  const messageType = buffer.readUintBE(0, config.PACKET.MESSAGE_TYPE_LENGTH);

  console.log(" messageType => ", messageType);

  const versionLength = buffer.readUintBE(
    config.PACKET.MESSAGE_TYPE_LENGTH,
    config.PACKET.VERSION_LENGTH
  );

  console.log(" versionLength => ", versionLength);

  let offset = config.PACKET.MESSAGE_TYPE_LENGTH + config.PACKET.VERSION_LENGTH;

  console.log(" offset => ", offset);

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
