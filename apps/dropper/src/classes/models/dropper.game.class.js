import { Game, IntervalManager } from '@repo/common/classes';
import { dropperMap } from '../../map/dropper.Map.js';
import dropperUser from './dropper.user.class.js';

export const sessionIds = new Map();

class dropperGame extends Game {
  constructor(id) {
    super(id);

    // ! 종료시간이 정해져있는 게임은 아님
    // TODO: 시작 위치에 대해서 다시 확인해보기(0,2,6,8)
    this.intervalManager = new IntervalManager();
    this.startPosition = dropperMap.startPosition;
    this.slot = new Array(9).fill(false);
    this.stage = 0;
    //! timeOut? interval?
    this.moveTimer;
    this.fallTimer;
    this.startMoveTimer;
  }

  async addUser(users, gameId) {
    for (let key in users) {
      const userId = users[key];

      const position = this.startPosition[key].pos;
      const rotation = this.startPosition[key].rot;

      if (!sessionIds.get(userId)) {
        sessionIds.set(userId, gameId);
      }

      const newUser = new dropperUser(gameId, userId, position, rotation);

      this.users.push(newUser);
    }
  }
}

export default dropperGame;
