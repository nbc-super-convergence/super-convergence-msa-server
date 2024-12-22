import { MESSAGE_TYPE } from '@repo/common/header';

export const iceMiniGameReadyNotification = (users) => {
  const type = MESSAGE_TYPE.ICE_MINI_GAME_READY_NOTIFICATION;

  const payload = {
    players: users.map((user) => ({
      sessionId: user.sessionId,
      position: user.position,
      rotation: user.rotation,
    })),
  };

  return { type, payload };
};

export const iceGameReadyNotification = (sessionId) => {
  const type = MESSAGE_TYPE.ICE_GAME_READY_NOTIFICATION;
  const payload = { sessionId };

  return { type, payload };
};

export const iceMiniGameStartNotification = () => {
  const type = MESSAGE_TYPE.ICE_MINI_GAME_START_NOTIFICATION;
  const payload = {};

  return { type, payload };
};

export const icePlayerSyncNotification = (user) => {
  const type = MESSAGE_TYPE.ICE_PLAYERS_SYNC_NOTIFICATION;

  const payload = {
    sessionId: user.sessionId,
    position: user.position,
    rotation: user.rotation,
    state: user.state,
  };

  return { type, payload };
};

export const icePlayerDamageNotification = (sessionId) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_DAMAGE_NOTIFICATION;

  const payload = { sessionId };

  return { type, payload };
};

/**
 * 유저 사망시 패킷 생성
 * @param {Object} user
 * @returns {Buffer}
 */
export const icePlayerDeathNotification = (user) => {
  const type = MESSAGE_TYPE.ICE_PLAYER_DEATH_NOTIFICATION;
  const payload = { sessionId: user.sessionId };

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
  // * 유저를 오름차순으로 정렬
  const sortedUsers = users.sort((a, b) => a.rank - b.rank);

  const ranks = sortedUsers.map((user) => {
    return { sessionId: user.sessionId, rank: user.rank };
  });

  // ranks와 endTime으로 payload 생성
  const payload = { ranks, endTime: Date.now() + 6000 };

  return { type, payload };
};

export const iceMapSyncNotification = () => {
  const type = MESSAGE_TYPE.ICE_MAP_SYNC_NOTIFICATION;

  const payload = {};

  return { type, payload };
};
