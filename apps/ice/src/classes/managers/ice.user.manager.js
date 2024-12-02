import { serializeForGate } from '@repo/common/utils';
import {
  icePlayerDamageNotification,
  icePlayerDeathNotification,
  icePlayerSyncNotification,
} from '../../utils/ice.notifications.js';
import iceUser from '../models/ice.user.class.js';
import { iceConfig } from '../../config/config.js';

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

  addUser(gameId, sessionId, position, rotation) {
    const user = new iceUser(gameId, sessionId, position, rotation);

    this.users.push(user);
    return user;
  }

  getUserBySessionId(sessionId) {
    return this.users.find((user) => user.sessionId === sessionId);
  }

  getAllUserBySessionId(sessionId) {
    return this.users.filter((user) => user.gameId === sessionId);
  }

  isValidUser(user) {
    return this.users.includes(user) ? true : false;
  }

  isValidUserPosition(user, game) {
    const position = user.getPosition();

    const mapSize = game.getMapSize();
    if (
      position.x > mapSize.max ||
      position.z > mapSize.max ||
      position.x < mapSize.min ||
      position.z < mapSize.min
    ) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: GlobalFailCode용 로직
  // userValidation(user) {
  //   if (this.users.includes(user)) {
  //     const failCode = iceConfig.FAIL_CODE.USER_IN_GAME_NOT_FOUND;
  //   }

  //   return failCode;
  // }

  icePlayerSyncNoti(user, game, payload) {
    //* 유저 위치 정보 업데이트
    console.log(`[iceUserManager - icePlayerSyncNoti]`);

    user.updateUserInfos(payload.position, payload.rotation, payload.state);

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerSyncNotification(user);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }

  icePlayerDamageNoti(user, game) {
    // * 플레이어에 데미지
    console.log(`[iceUserManager - icePlayerDamageNoti]`);

    user.damage();

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerDamageNotification(user.sessionId);

    const buffer = serializeForGate(message.type, message.payload, sessionIds);

    return buffer;
  }

  icePlayerDeathNoti(user, game) {
    // * 플레이어 사망
    console.log(`[iceUserManager - icePlayerDeathNoti]`);

    user.Dead();

    // * 사망시 랭킹
    user.rank = game.getAliveUser().length + 1;

    const sessionIds = game.getOtherSessionIds(user.sessionId);

    const message = icePlayerDeathNotification(user);

    const buffer = serializeForGate(message.type, message.payload, 0, sessionIds);

    return buffer;
  }
}

const iceUserManagerInstance = iceUserManager.getInstance();
Object.freeze(iceUserManagerInstance);

export default iceUserManagerInstance;
