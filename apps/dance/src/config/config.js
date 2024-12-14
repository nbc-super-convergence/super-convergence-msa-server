import { DIRECTION, GAME_MODE, GAME_STATE, MESSAGE_TYPE, REASON } from '../utils/constants.js';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORTS } from './env.js';

export const danceConfig = {
  REDIS: {
    CHANNEL: 'boardChannel',
    PREFIX_PLAYER: 'boardPlayers',
    CLUSTER: true,
    NODES: [
      //* 마스터 노드
      { HOST: REDIS_HOST, PORT: REDIS_PORTS.PORT1 },
      { HOST: REDIS_HOST, PORT: REDIS_PORTS.PORT2 },
      { HOST: REDIS_HOST, PORT: REDIS_PORTS.PORT3 },
      //* 복제 노드
      { HOST: REDIS_HOST, PORT: REDIS_PORTS.PORT4 },
      { HOST: REDIS_HOST, PORT: REDIS_PORTS.PORT5 },
      { HOST: REDIS_HOST, PORT: REDIS_PORTS.PORT6 },
    ],
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
