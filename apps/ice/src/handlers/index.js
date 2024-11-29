import { MESSAGE_TYPE } from '@repo/common/header';
import {
  iceGameReadyRequestHandler,
  iceMiniGameStartRequestHandler,
  icePlayerDamageRequestHandler,
  icePlayerSyncRequestHandler,
} from './ice.handlers.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.ICE_MINI_GAME_START_REQUEST]: {
    handler: iceMiniGameStartRequestHandler,
    message: 'ice.C2S_IceMiniGameStartRequest',
    payload: 'iceMiniGameStartRequest',
  },
  [MESSAGE_TYPE.ICE_MINI_GAME_READY_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceMiniGameStartResponse',
    payload: 'iceMiniGameStartResponse',
  },
  [MESSAGE_TYPE.ICE_GAME_READY_REQUEST]: {
    handler: iceGameReadyRequestHandler,
    message: 'ice.C2S_IceGameReadyRequest',
    payload: 'iceGameReadyRequest',
  },
  [MESSAGE_TYPE.ICE_GAME_READY_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceGameReadyNotification',
    payload: 'iceGameReadyNotification',
  },
  [MESSAGE_TYPE.ICE_MINI_GAME_START_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceGameStartNotification',
    payload: 'iceGameStartNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_SYNC_REQUEST]: {
    handler: icePlayerSyncRequestHandler,
    message: 'ice.C2S_IcePlayerSyncRequest',
    payload: 'icePlayerSyncRequest',
  },
  [MESSAGE_TYPE.ICE_PLAYERS_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerSyncNotification',
    payload: 'icePlayerSyncNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_DAMAGE_REQUEST]: {
    handler: icePlayerDamageRequestHandler,
    message: 'ice.C2S_IcePlayerDamageRequest',
    payload: 'icePlayerDamageRequest',
  },
  [MESSAGE_TYPE.ICE_PLAYER_DAMAGE_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerDamageNotification',
    payload: 'icePlayerDamageNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_DEATH_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerDeathNotification',
    payload: 'icePlayerDeathNotification',
  },
  [MESSAGE_TYPE.ICE_MAP_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceMapSyncNotification',
    payload: 'iceMapSyncNotification',
  },
  [MESSAGE_TYPE.ICE_GAME_OVER_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceGameOverNotification',
    payload: 'iceGameOverNotification',
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
    console.error(`프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `);
    throw new Error(`프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `);
  }
  return handlers[messageType].message;
};

//
export const getPayloadNameByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `);
    throw new Error(`프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `);
  }
  return handlers[messageType].payload;
};
