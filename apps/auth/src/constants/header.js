export const MESSAGE_TYPE_LENGTH = 2;
export const VERSION_LENGTH = 1;
export const SEQUENCE_LENGTH = 4;
export const PAYLOAD_LENGTH = 4;

export const MESSAGE_TYPE = {
  //   // * 빙판 게임 Request
  //   ICE_JOIN_REQUEST: 1,
  //   ICE_START_REQUEST: 2,
  //   ICE_PLAYER_MOVE_REQUEST: 3,

  //   // * 빙판 게임 Notification
  //   ICE_MOVE_NOTIFICATION: 4,
  //   ICE_PLAYER_SPAWN_NOTIFICATION: 5,
  //   ICE_START_NOTIFICATION: 6,
  //   ICE_PLAYERS_STATE_SYNC_NOTIFICATION: 7,
  //   ICE_PLAYER_DEATH_NOTIFICATION: 8,
  //   ICE_MAP_STATE_SYNC_NOTIFICATION: 9,
  //   ICE_OVER_NOTIFICATION: 10,
  //   ICE_PLAYER_MOVE_NOTIFICATION: 11,

  //   // * DISTRIBUTOR
  //   SERVER_INFO_NOTIFICATION: 20,

  // * Auth [1 - 9]
  REGISTER_REQUEST: 1,
  REGISTER_RESPONSE: 2,
  LOGIN_REQUEST: 3,
  LOGIN_RESPONSE: 4,
  LOGIN_NOTIFICATION: 5, // 미정
};
