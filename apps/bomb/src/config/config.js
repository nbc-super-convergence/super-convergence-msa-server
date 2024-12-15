import { FAIL_CODE } from '@repo/common/failcodes';
import { REDIS } from '../constants/env.js';

export const bombConfig = {
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
  REWARD: [20, 10, 5, 1],
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
