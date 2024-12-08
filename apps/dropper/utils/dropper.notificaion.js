import { MESSAGE_TYPE } from '@repo/common/header';

export const dropMiniGameReadyNotification = (users) => {
  const type = MESSAGE_TYPE.DROP_MINI_GAME_READY_NOTIFICATION;

  const payload = {
    players: users.map((user) => ({
      sessionId: user.sessionId,
      position: user.position,
      rotation: user.rotation,
    })),
  };

  return { type, payload };
};

export const dropGameReadyNotification = (sessionId) => {
  const type = MESSAGE_TYPE.DROP_GAME_READY_NOTIFICATION;
  const payload = { sessionId };

  return { type, payload };
};

export const dropMiniGameStartNotification = () => {
  const type = MESSAGE_TYPE.DROP_MINI_GAME_START_NOTIFICATION;
  const payload = {};

  return { type, payload };
};

export const dropPlayerSyncNotification = (user) => {
  const type = MESSAGE_TYPE.DROP_PLAYER_SYNC_NOTIFICATION;

  const payload = {
    sessionId: user.sessionId,
    slot: user.slot,
    rotation: user.rotation,
    state: user.state,
  };

  return { type, payload };
};

export const dropPlayerDeathNotification = (user) => {
  const type = MESSAGE_TYPE.DROP_PLAYER_DEATH_NOTIFICATION;
  const payload = { sessionId: user.sessionId };

  return { type, payload };
};

export const dropLevelStartNotification = () => {
  const type = MESSAGE_TYPE.DROP_LEVEL_START_NOTIFICATION;
  const payload = {};

  return { type, payload };
};

export const dropLevelEndNotification = (game) => {
  const type = MESSAGE_TYPE.DROP_LEVEL_END_NOTIFICATION;

  const holes = new Array.from({ length: game.stage }, (_, i) => i);

  const payload = { holes: holes };

  return { type, payload };
};

export const dropGameOverNotification = (users) => {
  const type = MESSAGE_TYPE.DROP_GAME_OVER_NOTIFICATION;

  // ranks 배열 생성
  const ranks = users.map((user) => {
    return { sessionId: user.sessionId, rank: user.rank };
  });

  // ranks와 endTime으로 payload 생성
  const payload = { ranks, endTime: Date.now() + 6000 };

  return { type, payload };
};
