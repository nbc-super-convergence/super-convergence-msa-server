import { FAIL_CODE } from '@repo/common/failcodes';
import { REDIS } from '../constants/env.js';

export const bombConfig = {
  REDIS: {
    CHANNEL: 'boardChannel',
    PREFIX_PLAYER: 'boardPlayers',
    REDIS_INFO: {
      host: REDIS.host,
      port: REDIS.port,
      password: REDIS.password,
    },
  },
  BOARD: {
    PLAYERS: 'players',
  },
  FAIL_CODE,
};

export const bombMap = {
  sizes: {
    min: -15,
    max: 15,
  },
  startPosition: [
    { pos: { x: -6.5, y: 1, z: 6.5 }, rot: 135 },
    { pos: { x: 6.5, y: 1, z: 6.5 }, rot: -135 },
    { pos: { x: -6.5, y: 1, z: -6.5 }, rot: -45 },
    { pos: { x: 6.5, y: 1, z: -6.5 }, rot: 45 },
  ],
};
