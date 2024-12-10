import { MESSAGE_TYPE } from '@repo/common/header';

export const bombMiniGameReadyNotification = (users, bombUser) => {
  const type = MESSAGE_TYPE.BOMB_MINI_GAME_READY_NOTIFICATION;

  const payload = {
    players: users.map((user) => ({
      sessionId: user.sessionId,
      position: user.position,
      rotation: user.rotation,
      bombSessionId: bombUser,
    })),
  };

  return { type, payload };
};

export const bombGameReadyNotification = (sessionId) => {
  const type = MESSAGE_TYPE.BOMB_GAME_READY_NOTIFICATION;
  const payload = { sessionId };

  return { type, payload };
};

export const bombMiniGameStartNotification = () => {
  const type = MESSAGE_TYPE.BOMB_MINI_GAME_START_NOTIFICATION;
  const payload = {};

  return { type, payload };
};

export const bombPlayerSyncNotification = (user) => {
  const type = MESSAGE_TYPE.BOMB_PLAYERS_SYNC_NOTIFICATION;

  const payload = {
    sessionId: user.sessionId,
    position: user.position,
    rotation: user.rotation,
    state: user.state,
  };

  return { type, payload };
};

/**
 * 폭탄 보유자 이동
 * @param {String} sessionId 폭탄 받는 대상
 * @returns {Buffer}
 */
export const bombMoveNotification = (sessionId) => {
  const type = MESSAGE_TYPE.BOMB_MOVE_NOTIFICATION;
  const payload = { sessionId: sessionId };

  return { type, payload };
};

/**
 * 폭탄 보유자 사망
 * 폭탄 타이머 완료 시
 * @param {String} sessionId 사망하는 폭탄 보유자
 * @param {String} bombSessionId 다음 폭탄 받는 유저
 * @returns {Buffer}
 */
export const bombPlayerDeathNotification = (sessionId, bombSessionId) => {
  const type = MESSAGE_TYPE.BOMB_PLAYER_DEATH_NOTIFICATION;
  const payload = { sessionId: sessionId, bombSessionId: bombSessionId };

  return { type, payload };
};

/**
 * 게임 종료시 패킷 생성
 * @param {Array} users
 * @returns {Buffer}
 */
export const bombGameOverNotification = (users) => {
  const type = MESSAGE_TYPE.BOMB_GAME_OVER_NOTIFICATION;

  // ranks 배열 생성
  const ranks = users.map((user) => {
    return { sessionId: user.sessionId, rank: user.rank };
  });

  // ranks와 endTime으로 payload 생성
  const payload = { ranks, endTime: Date.now() + 6000 };

  return { type, payload };
};
