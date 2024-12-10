import { Game, IntervalManager, TimeoutManager } from '@repo/common/classes';
import { logger } from '@repo/common/config';
import BombUser from './bomb.user.class.js';
import { bombMap } from '../../config/config.js';
import { GAME_STATE } from '../../constants/game.js';
import {
  bombGameOverNotification,
  bombPlayerDeathNotification,
} from '../../utils/bomb.notifications.js';
import { USER_STATE } from '../../constants/user.js';
import { serializeForGate } from '@repo/common/utils';
import bombGameManagerInstance from '../managers/bomb.game.manager.js';

export const sessionIds = new Map();

class BombGame extends Game {
  constructor(id) {
    super(id);

    this.map = bombMap;
    this.intervalManager = new IntervalManager();
    this.timeoutManager = new TimeoutManager();
    this.startPosition = bombMap.startPosition;
    this.state = GAME_STATE.WAIT;

    this.bombUser = null;
  }

  async addUser(gameId, users) {
    for (let key in users) {
      const userId = users[key];
      const position = this.startPosition[key].pos;
      const rotation = this.startPosition[key].rot;

      if (!sessionIds.get(userId)) {
        sessionIds.set(userId, gameId);
      }

      const newUser = new BombUser(gameId, userId, position, rotation);

      this.users.push(newUser);
    }

    logger.info(`유저들`, this.users);
  }

  isAllReady() {
    return this.users.filter((user) => user.isReady === true).length === this.users.length;
  }

  setGameState(state) {
    this.state = state;
  }

  getAllSessionIds() {
    return this.users.map((user) => user.sessionId);
  }

  getOtherSessionIds(sessionId) {
    const users = this.users.filter((user) => user.sessionId !== sessionId);

    return users.map((user) => user.sessionId);
  }

  getAllUser() {
    return this.users;
  }

  getAliveUsers() {
    return this.users.filter((user) => user.state !== USER_STATE.DIE);
  }

  getUserToSessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  bombUserSelect() {
    const survivor = this.getAliveUsers();
    const randomUser = Math.floor(Math.random() * survivor.length);
    const bombUser = survivor[randomUser];
    return bombUser.sessionId;
  }

  bombUserChange(sessionId) {
    this.bombUser = sessionId;
  }

  bombTimerStart(socket) {
    const randomTime = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000;

    this.timeoutManager.addTimeout(this.id, () => this.bombTimeout(socket), randomTime, 'bomb');
    // setTimeout(() => {
    //   this.bombTimeout();
    // }, randomTime);
    logger.info(`${this.id} 게임의 폭탄 시작, ${randomTime}ms 후 폭발`);
  }

  bombTimeout(socket) {
    const targetUser = this.getUserToSessionId(this.bombUser);

    targetUser.boom();
    const survivor = this.getAliveUsers();

    targetUser.ranking(survivor.length + 1);
    const nextBombUser = this.bombUserSelect();
    this.bombUserChange(nextBombUser);
    const message = bombPlayerDeathNotification(targetUser.sessionId, nextBombUser);
    const sessionIds = this.getAllSessionIds();
    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);
    socket.write(buffer);

    if (survivor.length <= 1) {
      // 생존자 1명
      // 바로 보낼 시, 너무 빨리 끝남
      survivor[0].ranking(1);
      const users = this.getAllUser();
      const message = bombGameOverNotification(users);
      const sessionIds = this.getAllSessionIds();
      const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

      socket.write(buffer);
      this.resetGame(users);
    } else {
      this.bombTimerStart(socket);
    }
  }

  resetGame(users) {
    this.timeoutManager.removeAllTimeoutById(this.id);
    this.bombUser = null;
    this.setGameState(GAME_STATE.WAIT);
    for (const user of users) {
      user.reset();
    }
  }
}

export default BombGame;
