import { MESSAGE_TYPE } from "../constants/header.js";

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.ICE_JOIN_REQUEST]: {
    handler: undefined,
    message: "ice.C2S_IceJoinRequest",
    payload: "iceJoinRequest",
  },
  [MESSAGE_TYPE.ICE_PLAYER_MOVE_REQUEST]: {
    handler: undefined,
    message: "ice.C2S_IcePlayerMoveRequest",
    payload: "icePlayerMoveRequest",
  },

  [MESSAGE_TYPE.ICE_START_REQUEST]: {
    handler: undefined,
    message: "game.C2S_IceStartRequest",
    payload: "iceStartRequest",
  },
  // * RESPONSE [handler X]

  // * NOTIFICATION [handler X]
  [MESSAGE_TYPE.ICE_PLAYER_SPAWN_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IcePlayerSpawnNotification",
    payload: "icePlayerSpawnNotification",
  },
  [MESSAGE_TYPE.ICE_PLAYERS_STATE_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IcePlayersStateSyncNotification",
    payload: "icePlayersStateSyncNotification",
  },
  [MESSAGE_TYPE.ICE_PLAYER_DEATH_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IcePlayerDeathNotification",
    payload: "icePlayerDeathNotification",
  },
  [MESSAGE_TYPE.ICE_MAP_STATE_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IceMapStateSyncNotification",
    payload: "iceMapStateSyncNotification",
  },
  [MESSAGE_TYPE.ICE_OVER_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IceOverNotification",
    payload: "iceOverNotification",
  },
  [MESSAGE_TYPE.ICE_START_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IceStartNotification",
    payload: "iceStartNotification",
  },
  [MESSAGE_TYPE.ICE_PLAYER_MOVE_NOTIFICATION]: {
    handler: undefined,
    message: "ice.S2C_IcePlayerMoveNotification",
    payload: "icePlayerMoveNotification",
  },
  [MESSAGE_TYPE.SERVER_INFO_NOTIFICATION]: {
    handler: undefined,
    message: "distributor.S2S_ServerInfoNotification",
    payload: "serverInfoNotification",
  },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};

export const getProtoTypeNameByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(
      `프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `
    );
    throw new Error(
      `프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `
    );
  }
  return handlers[messageType].message;
};

//
export const getPayloadNameByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(
      `프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `
    );
    throw new Error(
      `프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `
    );
  }
  return handlers[messageType].payload;
};
