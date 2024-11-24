import { MESSAGE_TYPE } from '../constants/header.js';

const handlers = {
  // Auth (1~9)
  [MESSAGE_TYPE.REGISTER_REQUEST]: {
    handler: undefined,
    message: 'auth.C2S_RegisterRequest',
    payload: 'registerRequest',
  },
  [MESSAGE_TYPE.REGISTER_RESPONSE]: {
    handler: undefined,
    message: 'auth.S2C_RegisterResponse',
    payload: 'registerResponse',
  },
  [MESSAGE_TYPE.LOGIN_REQUEST]: {
    handler: undefined,
    message: 'auth.C2S_LoginRequest',
    payload: 'loginRequest',
  },
  [MESSAGE_TYPE.LOGIN_RESPONSE]: {
    handler: undefined,
    message: 'auth.S2C_LoginResponse',
    payload: 'loginResponse',
  },

  // Distributor (10)
  [MESSAGE_TYPE.SERVER_INFO_NOTIFICATION]: {
    handler: undefined,
    message: 'distributor.S2S_ServerInfoNotification',
    payload: 'serverInfoNotification',
  },

  // Lobby (11-30)
  [MESSAGE_TYPE.LOBBY_JOIN_REQUEST]: {
    handler: undefined,
    message: 'lobby.C2S_LobbyJoinRequest',
    payload: 'lobbyJoinRequest',
  },
  [MESSAGE_TYPE.LOBBY_JOIN_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyJoinResponse',
    payload: 'lobbyJoinResponse',
  },
  [MESSAGE_TYPE.LOBBY_LEAVE_REQUEST]: {
    handler: undefined,
    message: 'lobby.C2S_LobbyLeaveRequest',
    payload: 'lobbyLeaveRequest',
  },
  [MESSAGE_TYPE.LOBBY_LEAVE_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyLeaveResponse',
    payload: 'lobbyLeaveResponse',
  },
  [MESSAGE_TYPE.LOBBY_USER_LIST_REQUEST]: {
    handler: undefined,
    message: 'lobby.C2S_LobbyUserListRequest',
    payload: 'lobbyUserListRequest',
  },
  [MESSAGE_TYPE.LOBBY_USER_LIST_RESPONSE]: {
    handler: undefined,
    message: 'lobby.S2C_LobbyUserListResponse',
    payload: 'lobbyUserListResponse',
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

  // Room (31-50)
  [MESSAGE_TYPE.ROOM_LIST_REQUEST]: {
    handler: undefined,
    message: 'room.C2S_RoomListRequest',
    payload: 'roomListRequest',
  },
  [MESSAGE_TYPE.ROOM_LIST_RESPONSE]: {
    handler: undefined,
    message: 'room.S2C_RoomListResponse',
    payload: 'roomListResponse',
  },
  [MESSAGE_TYPE.CREATE_ROOM_REQUEST]: {
    handler: undefined,
    message: 'room.C2S_CreateRoomRequest',
    payload: 'createRoomRequest',
  },
  [MESSAGE_TYPE.CREATE_ROOM_RESPONSE]: {
    handler: undefined,
    message: 'room.S2C_CreateRoomResponse',
    payload: 'createRoomResponse',
  },
  [MESSAGE_TYPE.JOIN_ROOM_REQUEST]: {
    handler: undefined,
    message: 'room.C2S_JoinRoomRequest',
    payload: 'joinRoomRequest',
  },
  [MESSAGE_TYPE.JOIN_ROOM_RESPONSE]: {
    handler: undefined,
    message: 'room.S2C_JoinRoomResponse',
    payload: 'joinRoomResponse',
  },
  [MESSAGE_TYPE.JOIN_ROOM_NOTIFICATION]: {
    handler: undefined,
    message: 'room.S2C_JoinRoomNotification',
    payload: 'joinRoomNotification',
  },
  [MESSAGE_TYPE.LEAVE_ROOM_REQUEST]: {
    handler: undefined,
    message: 'room.C2S_LeaveRoomRequest',
    payload: 'leaveRoomRequest',
  },
  [MESSAGE_TYPE.LEAVE_ROOM_RESPONSE]: {
    handler: undefined,
    message: 'room.S2C_LeaveRoomResponse',
    payload: 'leaveRoomResponse',
  },
  [MESSAGE_TYPE.LEAVE_ROOM_NOTIFICATION]: {
    handler: undefined,
    message: 'room.S2C_LeaveRoomNotification',
    payload: 'leaveRoomNotification',
  },
  [MESSAGE_TYPE.GAME_PREPARE_REQUEST]: {
    handler: undefined,
    message: 'room.C2S_GamePrepareRequest',
    payload: 'gamePrepareRequest',
  },
  [MESSAGE_TYPE.GAME_PREPARE_RESPONSE]: {
    handler: undefined,
    message: 'room.S2C_GamePrepareResponse',
    payload: 'gamePrepareResponse',
  },
  [MESSAGE_TYPE.GAME_PREPARE_NOTIFICATION]: {
    handler: undefined,
    message: 'room.S2C_GamePrepareNotification',
    payload: 'gamePrepareNotification',
  },

  // Ice Game (201-211)
  [MESSAGE_TYPE.ICE_JOIN_REQUEST]: {
    handler: undefined,
    message: 'ice.C2S_IceJoinRequest',
    payload: 'iceJoinRequest',
  },
  [MESSAGE_TYPE.ICE_START_REQUEST]: {
    handler: undefined,
    message: 'ice.C2S_IceStartRequest',
    payload: 'iceStartRequest',
  },
  [MESSAGE_TYPE.ICE_PLAYER_MOVE_REQUEST]: {
    handler: undefined,
    message: 'ice.C2S_IcePlayerMoveRequest',
    payload: 'icePlayerMoveRequest',
  },
  [MESSAGE_TYPE.ICE_MOVE_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceMoveNotification',
    payload: 'iceMoveNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_SPAWN_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerSpawnNotification',
    payload: 'icePlayerSpawnNotification',
  },
  [MESSAGE_TYPE.ICE_START_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceStartNotification',
    payload: 'iceStartNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYERS_STATE_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayersStateSyncNotification',
    payload: 'icePlayersStateSyncNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_DEATH_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerDeathNotification',
    payload: 'icePlayerDeathNotification',
  },
  [MESSAGE_TYPE.ICE_MAP_STATE_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceMapStateSyncNotification',
    payload: 'iceMapStateSyncNotification',
  },
  [MESSAGE_TYPE.ICE_OVER_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceOverNotification',
    payload: 'iceOverNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_MOVE_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerMoveNotification',
    payload: 'icePlayerMoveNotification',
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
