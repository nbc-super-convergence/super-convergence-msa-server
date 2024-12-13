export const STATE = {
  IDLE: 0,
  MOVE: 1,
  DIE: 2,
  DANCE_UP: 3,
  DANCE_DOWN: 4,
  DANCE_LEFT: 5,
  DANCE_RIGHT: 6,
  DANCE_FAIL: 7,
  DANCE_WAIT: 8,
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
  80: 'turnEndRequest',
  81: 'turnEndNotification',

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

  // dropper (301 ~ 310)
  301: 'dropMiniGameReadyNotification',
  302: 'dropGameReadyRequest',
  303: 'dropGameReadyNotification',
  304: 'dropMiniGameStartNotification',
  305: 'dropPlayerSyncRequest',
  306: 'dropPlayerSyncNotification',
  307: 'dropPlayerDeathNotification',
  308: 'dropLevelStartNotification',
  309: 'dropLevelEndNotification',
  310: 'dropGameOverNotification',

  // dance (401 ~ 500)
  401: 'danceMiniGameReadyNotification',
  402: 'danceReadyRequest',
  403: 'danceReadyNotification',
  404: 'danceStartNotification',
  405: 'danceTableCreateRequest',
  406: 'danceTableNotification',
  407: 'danceKeyPressRequest',
  408: 'danceKeyPressResponse',
  409: 'danceKeyPressNotification',
  410: 'danceGameOverNotification',
  411: 'danceCloseSocketNotification',
  412: 'danceTableCompleteRequest',

  // bomb  (501~)
  501: 'bombMiniGameReadyNotification',
  502: 'bombGameReadyRequest',
  503: 'bombGameReadyNotification',
  504: 'bombMiniGameStartNotification',
  505: 'bombPlayerSyncRequest',
  506: 'bombPlayerSyncNotification',
  507: 'bombPlayerDeathNotification',
  508: 'bombMoveRequest',
  509: 'bombMoveNotification',
  510: 'bombGameOverNotification',

  // dart (601~)
  601: 'dartMiniGameReadyNotification',
  602: 'dartGameReadyRequest',
  603: 'dartGameReadyNotification',
  604: 'dartMiniGameStartNotification',
  605: 'dartGameThrowRequest',
  606: 'dartGameThrowNotification',
  607: 'dartGameOverNotification',
  608: 'dartPannelSyncRequest',
  609: 'dartPannelSyncNotification',
  610: 'dartSyncRequest',
  611: 'dartSyncNotification',
};
