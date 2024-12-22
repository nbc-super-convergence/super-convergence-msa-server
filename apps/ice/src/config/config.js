import { FAIL_CODE } from '@repo/common/failcodes';
import { REDIS } from '../constants/env.js';

export const iceConfig = {
  REDIS: {
    CHANNEL: 'boardChannel',
    PREFIX_PLAYER: 'boardPlayers',
    CLUSTER: true,
    NODES: [
      //* 마스터 노드
      { host: REDIS.host, port: REDIS.PORTS.PORT1 },
      { host: REDIS.host, port: REDIS.PORTS.PORT2 },
      { host: REDIS.host, port: REDIS.PORTS.PORT3 },
      //* 복제 노드
      { host: REDIS.host, port: REDIS.PORTS.PORT4 },
      { host: REDIS.host, port: REDIS.PORTS.PORT5 },
      { host: REDIS.host, port: REDIS.PORTS.PORT6 },
    ],
    PUB_SUB: { host: REDIS.host, port: REDIS.PORTS.PUB_SUB },
    PASSWORD: REDIS.password,
  },
  BOARD: {
    PLAYERS: 'players',
  },
  FAIL_CODE,
};
