import { serializeForGate } from '@repo/common/utils';
import {
  icePlayerDamageNotification,
  icePlayerDeathNotification,
  icePlayerSyncNotification,
} from '../../utils/ice.notifications.js';
import iceUser from '../models/ice.user.class.js';

class iceUserManager {
  constructor() {
    if (iceUserManager.instance) {
      return iceUserManager.instance;
    }

    this.users = [];
  }

  static getInstance() {
    if (!iceUserManager.instance) {
      iceUserManager.instance = new iceUserManager();
    }
    return iceUserManager.instance;
  }

  addUser(id, gameId, sessionId) {
    const user = new iceUser(id, gameId, sessionId);

    this.users.push(user);
    return user;
  }

  // ! id = loginId
  getUserById(id) {
    return this.users.find((user) => user.id === id);
  }

  getUserByPlayerId(playerId) {
    return this.users.find((user) => user.player.id === playerId);
  }

  getUserBySessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  getAllUserBySessionId(sessionId) {
    return this.users.filter((user) => user.player.gameId === sessionId);
  }

  isValidUser(user) {
    return this.users.includes(user) ? true : false;
  }

  icePlayerSyncNoti(user, game, payload) {
    //* 유저 위치 정보 업데이트
    user.player.updateState(payload.position, payload.rotation, payload.state);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerSyncNotification(user);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

    return buffer;
  }

  icePlayerDamageNoti(user, game) {
    // * 플레이어에 데미지
    user.player.damage();

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerDamageNotification(user.sessionId);

    const payloadType = getPayloadNameByMessageType(message.type);

    const buffer = serializeForGate(message.type, message.payload, payloadType, sessionIds);

    return buffer;
  }

  icePlayerDeathNoti(user, game) {
    if (user.player.hp <= 0) {
      // * 플레이어 사망
      user.player.playerDead();

      // * 사망시 랭킹
      user.player.rank = game.getAliveUser().length + 1;

      const sessionIds = game.getOtherSessionIds(user.sessionId);

      const message = icePlayerDeathNotification(user);

      const payloadType = getPayloadNameByMessageType(message.type);

      const buffer = serializeForGate(message.type, message.payload, 0, payloadType, sessionIds);

      return buffer;
    }

    return;
  }
}

const iceUserManagerInstance = iceUserManager.getInstance();
Object.freeze(iceUserManagerInstance);

export default iceUserManagerInstance;
