import { ResponseHelper } from '@repo/common/classes';
import { config, logger } from '@repo/common/config';

/**
 * @typedef UserData
 * @property {string} sessionId
 * @property {string} nickname
 */

/**
 * @typedef {'wait' | 'prepare' | 'board' | 'mini'} RoomState
 */

/**
 * @typedef RoomData
 * @property {string} roomId
 * @property {string} ownerId
 * @property {string} roomName
 * @property {string} lobbyId
 * @property {RoomState} state
 * @property {Set<string>} users
 * @property {number} maxUser
 * @property {Set<string>} readyUsers
 */

/**
 * @typedef RoomReponse
 * @property {bool} success
 * @property {object} data
 * @property {number} failCode
 */

class Room {
  /**
   * 유저의 대기방 입장 가능 여부를 검증
   * @param {RoomData} roomData - 대기방 데이터
   * @param {string} sessionId - 입장하려는 유저의 세션 ID
   * @param {UserData} userData - 입장하려는 유저의 데이터
   * @returns {boolean} 입장 가능 여부
   */
  static validateJoin(roomData, sessionId) {
    try {
      if (!roomData || !sessionId) return false;
      if (roomData.users.size >= roomData.maxUser) return false;
      if (roomData.users.has(sessionId)) return false;
      if (roomData.state !== 'wait' && roomData.state !== 'prepare') return false;
      return true;
    } catch (error) {
      logger.error('[ validateJoin ] ====> unknown error', error);
      return false;
    }
  }

  /**
   * 유저를 대기방에 입장시킴
   * @param {RoomData} roomData - 대기방 데이터
   * @param {string} sessionId - 입장하려는 유저의 세션 ID
   * @param {UserData} userData - 입장하려는 유저의 데이터
   * @returns {RoomReponse} 입장 결과
   */
  static join(roomData, sessionId) {
    try {
      // 입장 여부 검증
      if (!this.validateJoin(roomData, sessionId)) {
        logger.error('[ join ] ====> validateJoin fail', { roomData, sessionId });
        if (roomData.users.size >= roomData.maxUser) {
          return ResponseHelper.fail(config.FAIL_CODE.ROOM_IS_FULL);
        }
        if (roomData.users.has(sessionId)) {
          return ResponseHelper.fail(config.FAIL_CODE.USER_ALREADY_IN_ROOM);
        }
        return ResponseHelper.fail(config.FAIL_CODE.INVALID_ROOM_STATE);
      }

      roomData.users.add(sessionId);

      logger.info('[ join ] ====> success');

      return ResponseHelper.success(roomData);
    } catch (error) {
      logger.error('[ join ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 유저를 대기방에서 퇴장시킴
   * @param {RoomData} roomData - 대기방 데이터
   * @param {string} sessionId - 퇴장하려는 유저의 세션 ID
   * @returns {RoomReponse} 퇴장 결과
   */
  static leave(roomData, sessionId) {
    try {
      if (!roomData.users.has(sessionId)) {
        logger.error('[ leave ] ====> roomData.users.has == false', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_IN_ROOM);
      }

      const prevState = roomData.state;

      roomData.users.delete(sessionId);
      roomData.readyUsers.delete(sessionId);

      if (roomData.ownerId === sessionId && roomData.users.size > 0) {
        roomData.ownerId = Array.from(roomData.users.keys())[0];

        roomData.readyUsers.delete(roomData.ownerId);
      }

      // 방장이 나가는 경우
      if (roomData.ownerId === sessionId) {
        // 남은 유저가 있으면 첫 번째 유저를 방장으로 설정
        const remainingUsers = Array.from(roomData.users);
        if (remainingUsers.length > 0) {
          roomData.ownerId = remainingUsers[0];
          // 방 상태를 'wait'로 변경
          if (roomData.state === 'prepare') {
            roomData.state = 'wait';
          }
        }
      }

      const stateChanged = prevState !== roomData.state;

      logger.info('[ leave ] ====> success');

      return ResponseHelper.success(roomData, {
        stateChanged,
        ownerId: roomData.ownerId,
      });
    } catch (error) {
      logger.error('[ leave ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 유저의 준비 상태를 변경
   * @param {RoomData} roomData - 대기방 데이터
   * @param {string} sessionId - 준비 상태를 변경할 유저의 세션 ID
   * @param {boolean} isReady - 준비 상태 여부
   * @returns {RoomReponse} 준비 상태 변경 결과
   */
  static updateReady(roomData, sessionId, isReady) {
    try {
      if (sessionId === roomData.ownerId) {
        logger.error('[ updateReady ] ====> owner can not prepare', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.OWNER_CANNOT_READY);
      }

      if (!roomData.users.has(sessionId)) {
        logger.error('[ updateReady ] ====> roomData.users.has == false', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_IN_ROOM);
      }

      if (roomData.state !== 'wait' && roomData.state !== 'prepare') {
        logger.error('[ updateReady ] ====> state must be wait or prepare', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.INVALID_ROOM_STATE);
      }

      if (roomData.state === 'prepare' && !isReady) {
        roomData.state = 'wait';
      }

      if (isReady) {
        roomData.readyUsers.add(sessionId);
      } else {
        roomData.readyUsers.delete(sessionId);
      }

      const allUsersReady = Array.from(roomData.users.keys())
        .filter((id) => id !== roomData.ownerId)
        .every((id) => roomData.readyUsers.has(id));

      roomData.state = allUsersReady ? 'prepare' : 'wait';

      const prevState = roomData.state;
      logger.info('[ updateReady ] ====> success');

      if (prevState !== roomData.state) {
        logger.info('[ updateReady ] ====> change state', {
          roomId: roomData.roomId,
          prevState,
          newState: roomData.state,
        });
      }

      return ResponseHelper.success(
        { isReady: roomData.readyUsers.has(sessionId) },
        { state: roomData.state },
      );
    } catch (error) {
      logger.error('[ updateReady ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 방 상태값 유효성 검사
   * @param {RoomState} state - 검증할 방 상태값
   * @returns {boolean} 유효성 여부
   */
  static validateState(state) {
    return ['wait', 'prepare', 'board', 'mini'].includes(state);
  }

  /**
   * 새로운 대기방 데이터 생성
   * @param {string} roomId - 대기방 ID
   * @param {string} ownerId - 방장 세션 ID
   * @param {string} roomName - 대기방 이름
   * @param {string} lobbyId - 로비 ID
   * @returns {RoomData} 생성된 대기방 데이터
   */
  static createRoomData(roomId, ownerId, roomName, lobbyId) {
    return {
      roomId,
      ownerId,
      roomName,
      lobbyId,
      state: 'wait',
      maxUser: 4,
      users: new Set([ownerId]),
      readyUsers: new Set(),
    };
  }

  /**
   * 특정 세션을 제외한 대기방의 모든 유저 세션 ID 목록을 반환
   * @param {RoomData} roomData - 대기방 데이터
   * @param {string} excludeSessionId - 제외할 세션 ID
   * @returns {string[]} 다른 유저들의 세션 ID 배열
   */
  static getOtherSessionIds(roomData, excludeSessionId) {
    if (!roomData || !roomData.users || !Array.isArray(roomData.users)) {
      return [];
    }

    return roomData.users
      .filter((user) => user && user.sessionId !== excludeSessionId)
      .map((user) => user.sessionId);
  }
}

export default Room;
