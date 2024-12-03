export const STATE = {
  IDLE: 0,
  MOVE: 1,
  DIE: 2,
};

export const ROOM_STATE = {
  WAIT: 0,
  PREPARE: 1,
  BOARD: 2,
  MINI: 3,
};

export const FIELD_NAME = {
  // Auth (1~9)
  1: 'registerRequest',
  2: 'registerResponse',
  3: 'loginRequest',
  4: 'loginResponse',
  5: 'logoutRequest',
  8: 'closeSocketNotification',

  // close socket (9)
  9: 'closeSocketRequest',

  // distributor noti (10)
  10: 'serverInfoNotification',

  // Lobby (11-30)
  11: 'lobbyJoinRequest',
  12: 'lobbyJoinResponse',
  13: 'lobbyLeaveRequest',
  14: 'lobbyLeaveResponse',
  15: 'lobbyUserListRequest',
  16: 'lobbyUserListResponse',
  17: 'lobbyUserDetailRequest',
  18: 'lobbyUserDetailResponse',

  // Room (31-50)
  31: 'roomListRequest',
  32: 'roomListResponse',
  33: 'createRoomRequest',
  34: 'createRoomResponse',
  35: 'joinRoomRequest',
  36: 'joinRoomResponse',
  37: 'joinRoomNotification',
  38: 'leaveRoomRequest',
  39: 'leaveRoomResponse',
  40: 'leaveRoomNotification',
  41: 'gamePrepareRequest',
  42: 'gamePrepareResponse',
  43: 'gamePrepareNotification',

  // Game start (51-60)
  51: 'gameStartRequest',
  52: 'gameStartNotification',

  // Game Play (61-90)
  61: 'rollDiceRequest',
  62: 'rollDiceResponse',
  63: 'rollDiceNotification',
  64: 'movePlayerBoardRequest',
  65: 'movePlayerBoardResponse',
  66: 'movePlayerBoardNotification',
  67: 'purchaseTileRequest',
  68: 'purchaseTileResponse',
  69: 'purchaseTileNotification',
  70: 'gameEndNotification',
  71: 'purchaseTrophyRequest',
  72: 'purchaseTrophyResponse',
  73: 'purchaseTrophyNotification',
  74: 'tilePenaltyRequest',
  75: 'tilePenaltyResponse',
  76: 'tilePenaltyNotification',
  77: 'diceGameRequest',
  78: 'diceGameResponse',
  79: 'diceGameNotification',

  // Post Game (91-100)
  91: 'backToTheRoomRequest',
  92: 'backToTheRoomResponse',
  93: 'backToTheRoomNotification',

  // Mini Game (101-110)
  101: 'startMiniGameRequest',

  // ice  (201)
  201: 'iceMiniGameReadyNotification',
  202: 'iceGameReadyRequest',
  203: 'iceGameReadyNotification',
  204: 'iceMiniGameStartNotification',
  205: 'icePlayerSyncRequest',
  206: 'icePlayerSyncNotification',
  207: 'icePlayerDamageRequest',
  208: 'icePlayerDamageNotification',
  209: 'icePlayerDeathNotification',
  210: 'iceGameOverNotification',
  211: 'iceMapSyncNotification',
};
