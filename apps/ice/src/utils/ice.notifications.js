import { MESSAGE_TYPE } from '@repo/common/header';

export const iceMiniGameStartNotification = (users, startTime) => {
  const type = MESSAGE_TYPE.ICE_MINI_GAME_START_NOTIFICATION;
  const payload = {
    startPlayers: users.map((user) => ({
      playerId: user.player.id,
      playerType: user.player.type,
      position: user.player.position,
      rotation: user.player.rotation,
    })),
    startTime,
  };

  return { type, payload };
};

export const iceGameReadyNotification = (playerId) => {
  const type = MESSAGE_TYPE.ICE_GAME_READY_NOTIFICATION;
  const payload = { playerId };

  return { type, payload };
};

export const iceGameStartNotification = (startTime) => {
  const type = MESSAGE_TYPE.ICE_GAME_START_NOTIFICATION;
  const payload = { startTime };

  return { type, payload };
};

export const icePlayerSyncNotification = (user) => {
  const type = MESSAGE_TYPE.ICE_PLAYERS_SYNC_NOTIFICATION;

  const payload = {
    playerId: user.player.id,
    position: user.player.position,
    rotation: user.player.rotation,
    state: user.player.state,
  };

  return { type, payload };
};

export const icePlayerDamageNotification = (playerId) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_DAMAGE_NOTIFICATION;

  const payload = { playerId };

  return { type, payload };
};

/**
 * 유저 사망시 패킷 생성
 * @param {Object} user
 * @returns {Buffer}
 */
export const icePlayerDeathNotification = (user) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_DEATH_NOTIFICATION;
  const payload = { playerId: user.player.id, position: user.player.position };

  return { type, payload };
};

/**
 * 게임 종료시 패킷 생성
 * @param {Array} users
 * @returns {Buffer}
 */
export const iceGameOverNotification = (users) => {
  const type = MESSAGE_TYPE.ICE_GAME_OVER_NOTIFICATION;

  // ranks 배열 생성
  const ranks = users.map((user) => {
    return { playerId: user.player.id, rank: user.player.rank };
  });

  // ranks와 endTime으로 payload 생성
  const payload = { ranks, endTime: Date.now() };

  return { type, payload };
};

export const iceMapSyncNotification = (MapInfos) => {
  const type = MESSAGE_TYPE.ICE_MAP_SYNC_NOTIFICATION;

  const payload = { MapInfos };

  return { type, payload };
};
