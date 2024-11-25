import { MESSAGE_TYPE } from '@repo/common/header';

/**
 * 빙판 게임 이동 알림 생성
 * @param {*} playerId
 * @param {*} gameType
 * @returns
 */
export const createIceMoveNotification = (playerId, gameType) => {
  const type = MESSAGE_TYPE.ICE_MOVE_NOTIFICATION;
  const payload = { playerId, gameType };
  return { type, payload };
};

/**
 * 빙판 게임 플레이어 스폰 알림 생성
 * @param {*} playerId
 * @param {*} position
 * @param {*} playerType
 * @returns
 */
export const createIcePlayerSpawnNotification = (
  playerId,
  playerType,
  position,
  vector,
  rotation,
) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_SPAWN_NOTIFICATION;
  const payload = { playerId, playerType, position, vector, rotation };
  return { type, payload };
};

/**
 * 상태 동기화 알림 패킷 생성 함수
 * @param {Object} userState game 클래스의 getUserState 메소드
 * @returns { type, payload }
 */
export const icePlayersStateSyncNotification = (userState) => {
  const type = MESSAGE_TYPE.ICE_PLAYERS_STATE_SYNC_NOTIFICATION;
  const payload = userState;
  return { type, payload };
};

/**
 * 유저 사망시 패킷 생성
 * @param {Object} user
 * @returns {Buffer}
 */
export const icePlayerDeathNotification = (user) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_DEATH_NOTIFICATION;
  const payload = { playerId: user.player.id };

  return { type, payload };
};

/**
 * 게임 종료시 패킷 생성
 * @param {Array} users
 * @returns {Buffer}
 */
export const iceGameOverNotification = (users) => {
  const type = MESSAGE_TYPE.ICE_OVER_NOTIFICATION;

  // ranks 배열 생성
  const ranks = users.map((user) => {
    return { playerId: user.player.id, rank: user.player.rank };
  });

  // ranks와 endTime으로 payload 생성
  const payload = { ranks, endTime: Date.now() };

  return { type, payload };
};

export const iceMapSyncNotification = (scale) => {
  const type = MESSAGE_TYPE.ICE_MAP_STATE_SYNC_NOTIFICATION;

  const payload = { scale };

  return { type, payload };
};

/**
 * 테스트 게임 시작 승인
 * @param {playerId} playerId
 * @returns { type, payload }
 */
export const iceStartTestGame = (playerId) => {
  const type = MESSAGE_TYPE.ICE_START_NOTIFICATION;
  const payload = { playerId: playerId };

  return { type, payload };
};

export const icePlayerMoveNotification = (userPositions) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_MOVE_NOTIFICATION;
  const payload = userPositions;

  return { type, payload };
};
