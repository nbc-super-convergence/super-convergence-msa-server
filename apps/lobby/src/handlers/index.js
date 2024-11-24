import { MESSAGE_TYPE } from '../utils/constants.js';
import { lobbyJoinRequestHandler } from './lobby/lobby.join.handler.js';
import { lobbyLeaveRequestHandler } from './lobby/lobby.leave.handler.js';
import { lobbyUserDetailRequestHandler } from './lobby/lobby.user.detail.handler.js';
import { lobbyUserListRequestHandler } from './lobby/lobby.user.list.handler.js';

const handlers = {
  // * lobby
  [MESSAGE_TYPE.LOBBY_JOIN_REQUEST]: {
    handler: lobbyJoinRequestHandler,
    message: 'lobby.C2S_LobbyJoinRequest',
    payload: 'lobbyJoinRequest',
  },
  [MESSAGE_TYPE.LOBBY_JOIN_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyJoinResponse',
    payload: 'lobbyJoinResponse',
  },
  [MESSAGE_TYPE.LOBBY_LEAVE_REQUEST]: {
    handler: lobbyLeaveRequestHandler,
    message: 'lobby.C2S_LobbyLeaveRequest',
    payload: 'lobbyLeaveRequest',
  },
  [MESSAGE_TYPE.LOBBY_LEAVE_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyLeaveResponse',
    payload: 'lobbyLeaveResponse',
  },
  [MESSAGE_TYPE.LOBBY_USER_LIST_REQUEST]: {
    handler: lobbyUserListRequestHandler,
    message: 'lobby.C2S_LobbyUserListRequest',
    payload: 'lobbyUserListRequest',
  },
  [MESSAGE_TYPE.LOBBY_USER_LIST_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyUserListResponse',
    payload: 'lobbyUserListResponse',
  },
  [MESSAGE_TYPE.LOBBY_USER_DETAIL_REQUEST]: {
    handler: lobbyUserDetailRequestHandler,
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
