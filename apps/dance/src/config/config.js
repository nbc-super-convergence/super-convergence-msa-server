import { DIRECTION, GAME_STATE, MESSAGE_TYPE, REASON } from '../utils/constants.js';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './env.js';

export const danceConfig = {
  REDIS: {
    CHANNEL: 'boardChannel',
    PREFIX_PLAYER: 'boardPlayers',
    REDIS_INFO: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    },
  },
  BOARD: {
    PLAYERS: 'players',
  },
  MESSAGE_TYPE,
  GAME_STATE,
  REASON,
  DIRECTION,
};
