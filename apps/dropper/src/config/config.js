import { FAIL_CODE } from '@repo/common/failcodes';
import { REDIS } from '../constants/env.js';

export const dropConfig = {
  REDIS: {
    CHANNEL: 'boardChannel',
    CHANNEL2: 'dropperGameChannel',
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
