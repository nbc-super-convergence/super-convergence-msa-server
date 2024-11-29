import { FAIL_CODE } from '@repo/common/failcodes';

export const config = {
  REDIS: {
    CHANNEL: 'boardChannel',
    PREFIX_PLAYER: 'boardPlayers',
  },
  BOARD: {
    PLAYERS: 'players',
  },
  FAIL_CODE,
};
