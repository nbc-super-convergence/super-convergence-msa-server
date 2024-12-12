import { FAIL_CODE } from '@repo/common/failcodes';
import { REDIS } from '../constants/env.js';

export const dartConfig = {
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
