import { MESSAGE_TYPE } from '@repo/common/header';

const handlers = {
  // * lobby
  [MESSAGE_TYPE.LOBBY_JOIN_REQUEST]: {
    handler: undefined,
    message: 'lobby.C2S_LobbyJoinRequest',
    payload: 'lobbyJoinRequest',
  },
  [MESSAGE_TYPE.LOBBY_NOTIFICATION]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyNotification',
    payload: 'lobbyNotification',
  },
  [MESSAGE_TYPE.LOBBY_CHAT_REQUEST]: {
    handler: undefined,
    message: 'lobby.C2S_LobbyChatRequest',
    payload: 'lobbyChatRequest',
  },
  [MESSAGE_TYPE.LOBBY_CHAT_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyChatResponse',
    payload: 'lobbyChatResponse',
  },
  [MESSAGE_TYPE.LOBBY_USER_LIST_NOTIFICATION]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyUserListNotification',
    payload: 'lobbyUserListNotification',
  },
  [MESSAGE_TYPE.LOBBY_USER_DETAIL_REQUEST]: {
    handler: undefined,
    message: 'lobby.C2S_LobbyUserDetailRequest',
    payload: 'lobbyUserDetailRequest',
  },
  [MESSAGE_TYPE.LOBBY_USER_DETAIL_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyUserDetailResponse',
    payload: 'lobbyUserDetailResponse',
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

export const getPayloadNameByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `);
    throw new Error(`프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `);
  }
  return handlers[messageType].payload;
};
