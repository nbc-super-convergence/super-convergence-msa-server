import { getPayloadNameByMessageType } from "../../handlers/index.js";
import { getProtoMessages } from "../../init/load.protos.js";

export const packetParser = (messageType, data) => {
  let payload;
  try {
    const protoMessages = getProtoMessages();
    const gamePacket = protoMessages.game.GamePacket;
    const decodedGamePacket = gamePacket.decode(data);
    const field = decodedGamePacket[getPayloadNameByMessageType(messageType)];
    payload = { ...field };
  } catch (e) {
    console.error("[ packetParser ] ===> ", e);
  }

  return payload;
};
