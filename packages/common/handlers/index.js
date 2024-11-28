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

  // board (51 ~ 100)
  [MESSAGE_TYPE.GAME_START_REQUEST]: {
    handler: undefined,
    message: 'board.C2S_GameStartRequest',
    payload: 'gameStartRequest',
  },
  [MESSAGE_TYPE.ROLL_DICE_REQUEST]: {
    handler: undefined,
    message: 'board.C2S_RollDiceRequest',
    payload: 'rollDiceRequest',
  },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_REQUEST]: {
    handler: undefined,
    message: 'board.C2S_MovePlayerBoardRequest',
    payload: 'movePlayerBoardRequest',
  },
  [MESSAGE_TYPE.PURCHASE_TILE_REQUEST]: {
    handler: undefined,
    message: 'board.C2S_PurchaseTileRequest',
    payload: 'purchaseTileRequest',
  },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_REQUEST]: {
    handler: undefined,
    message: 'board.C2S_BackToTheRoomRequest',
    payload: 'backToTheRoomRequest',
  },

  [MESSAGE_TYPE.ROLL_DICE_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_RollDiceResponse',
    payload: 'rollDiceResponse',
  },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_MovePlayerBoardResponse',
    payload: 'movePlayerBoardResponse',
  },
  [MESSAGE_TYPE.PURCHASE_TILE_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_PurchaseTileResponse',
    payload: 'purchaseTileResponse',
  },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_BackToTheRoomResponse',
    payload: 'backToTheRoomResponse',
  },

  [MESSAGE_TYPE.GAME_START_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_GameStartNotification',
    payload: 'gameStartNotification',
  },
  [MESSAGE_TYPE.ROLL_DICE_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_RollDiceNotification',
    payload: 'rollDiceNotification',
  },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_MovePlayerBoardNotification',
    payload: 'movePlayerBoardNotification',
  },
  [MESSAGE_TYPE.PURCHASE_TILE_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_PurchaseTileNotification',
    payload: 'purchaseTileNotification',
  },
  [MESSAGE_TYPE.GAME_END_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_GameEndNotification',
    payload: 'gameEndNotification',
  },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_BackToTheRoomNotification',
    payload: 'backToTheRoomNotification',
  },

  // Ice Game (201-212)
  [MESSAGE_TYPE.ICE_MINI_GAME_START_REQUEST]: {
    handler: undefined,
    message: 'ice.C2S_IceMiniGameStartRequest',
    payload: 'iceMiniGameStartRequest',
  },
  [MESSAGE_TYPE.ICE_MINI_GAME_READY_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IceMiniGameStartResponse',
    payload: 'iceMiniGameStartResponse',
  },
  [MESSAGE_TYPE.ICE_GAME_READY_REQUEST]: {
    handler: undefined,
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
    handler: undefined,
    message: 'ice.C2S_IcePlayerSyncRequest',
    payload: 'icePlayerSyncRequest',
  },
  [MESSAGE_TYPE.ICE_PLAYERS_SYNC_NOTIFICATION]: {
    handler: undefined,
    message: 'ice.S2C_IcePlayerSyncNotification',
    payload: 'icePlayerSyncNotification',
  },
  [MESSAGE_TYPE.ICE_PLAYER_DAMAGE_REQUEST]: {
    handler: undefined,
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
