import { DIRECTION, GAME_MODE, GAME_STATE, MESSAGE_TYPE, REASON } from '../utils/constants.js';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORTS } from './env.js';

export const danceConfig = {
  REDIS: {
    CHANNEL: 'boardChannel',
    PREFIX_PLAYER: 'boardPlayers',
    CLUSTER: true,
    NODES: [
      //* 마스터 노드
      { host: REDIS_HOST, port: REDIS_PORTS.PORT1 },
      { host: REDIS_HOST, port: REDIS_PORTS.PORT2 },
      { host: REDIS_HOST, port: REDIS_PORTS.PORT3 },
      //* 복제 노드
      { host: REDIS_HOST, port: REDIS_PORTS.PORT4 },
      { host: REDIS_HOST, port: REDIS_PORTS.PORT5 },
      { host: REDIS_HOST, port: REDIS_PORTS.PORT6 },
    ],
    PUB_SUB: { host: REDIS_HOST, port: REDIS_PORTS.PUB_SUB },
    PASSWORD: REDIS_PASSWORD,
  },
  BOARD: {
    PLAYERS: 'players',
  },
  MESSAGE_TYPE,
  GAME_STATE,
  REASON,
  DIRECTION,
  GAME_MODE,
};
