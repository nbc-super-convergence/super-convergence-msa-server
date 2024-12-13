import { Game, IntervalManager, TimeoutManager } from '@repo/common/classes';
import BombUser from './bomb.user.class.js';
import { bombMap } from '../../config/config.js';
import { GAME_STATE } from '../../constants/game.js';
import {
  bombGameOverNotification,
  bombPlayerDeathNotification,
} from '../../utils/bomb.notifications.js';
import { USER_STATE } from '../../constants/user.js';
import { serializeForGate } from '@repo/common/utils';
import { logger } from '../../utils/logger.utils.js';

export const sessionIds = new Map();

class BombGame extends Game {
  constructor(id) {
    super(id);

    this.map = bombMap;
    this.intervalManager = new IntervalManager();
    this.timeoutManager = new TimeoutManager();
    this.startPosition = bombMap.startPosition;
    this.state = GAME_STATE.END;

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
    if (this.users.length <= 0) {
      return false;
    }

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
    if (survivor.length <= 1) {
      return 'NULL';
    }
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
    logger.info(`${this.id} 게임의 폭탄 시작, ${randomTime}ms 후 폭발`);
  }

  bombTimeout(socket) {
    try {
      const survivor = this.getAliveUsers();
      this.bombUserDeath(socket, survivor);
      const afterSurvivor = this.getAliveUsers();

      if (afterSurvivor.length <= 1) {
        this.bombGameEnd(socket, afterSurvivor);
      } else {
        this.bombTimerStart(socket);
      }
    } catch (error) {
      logger.error(`[BombGame - Game.class , bombTimeout = error >>> ]`, error);
    }
  }

  bombUserDeath(socket, survivor) {
    const targetUser = this.getUserToSessionId(this.bombUser);
    targetUser.boom();
    targetUser.ranking(survivor.length);
    const nextBombUser = this.bombUserSelect();

    logger.info(`[BombGame - Game.class , bombUserDeath = nextBombUser >>> ]`, nextBombUser);

    this.bombUserChange(nextBombUser);
    const message = bombPlayerDeathNotification(targetUser.sessionId, nextBombUser);
    const sessionIds = this.getAllSessionIds();
    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);
    socket.write(buffer);
  }

  bombGameEnd(socket, survivor) {
    survivor[0].ranking(1);
    const users = this.getAllUser();
    const message = bombGameOverNotification(users);
    const sessionIds = this.getAllSessionIds();
    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);
    this.timeoutManager.addTimeout(
      this.id,
      () => {
        socket.write(buffer);
        this.resetGame(users);
      },
      3000,
      'end',
    );
    this.goldUpdate(users);
    this.locationDelete(users);
    logger.info(`[BombGame - Game.class, bombGameEnd = message >>> ]`, message);
  }

  goldUpdate(users) {
    users.forEach((user) => user.updateGlod());
  }

  locationDelete(users) {
    users.forEach((user) => user.updateLocation());
  }

  resetGame(users) {
    this.timeoutManager.removeAllTimeoutById(this.id);
    this.bombUser = null;
    this.setGameState(GAME_STATE.END);
    for (const user of users) {
      user.reset();
    }
  }

  removeUser(sessionId) {
    const users = this.users.filter((user) => user.sessionId !== sessionId);
    this.users = users;
  }
}

export default BombGame;
