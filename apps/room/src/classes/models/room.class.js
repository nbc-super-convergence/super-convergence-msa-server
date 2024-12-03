import { ResponseHelper } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { logger } from '../../utils/logger.utils.js';

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

const { ROOM_STATE } = config;

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
      if (!roomData || !sessionId) {
        logger.error('[ validateJoin ] ====> roomData or sessionId is undefined');
        return false;
      }

      if (roomData.users.size >= roomData.maxUser) {
        logger.error('[ validateJoin ] ====> room is full');
        return false;
      }

      if (roomData.users.has(sessionId)) {
        logger.error('[ validateJoin ] ====> not a user in the room');
        return false;
      }
      if (roomData.state !== ROOM_STATE.WAIT && roomData.state !== ROOM_STATE.PREPARE) {
        logger.error('[ validateJoin ] ====> room is aleady start');
        return false;
      }
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
        logger.error('[ leave ] ====> not a user in the room', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.USER_NOT_IN_ROOM);
      }

      //* 준비중이였던 유저가 나간 경우
      if (roomData.readyUsers.has(sessionId)) {
        roomData.state = ROOM_STATE.WAIT;
      }

      //* 대기방에서 퇴장 유저 정보 삭제
      roomData.users.delete(sessionId);
      roomData.readyUsers.delete(sessionId);

      //* 방장이 나가는 경우
      if (roomData.ownerId === sessionId && roomData.users.size > 0) {
        roomData.ownerId = Array.from(roomData.users)[0]; //* 다음 유저가 방장
        //* 방장으로 변경된 유저의 준비 취소
        roomData.readyUsers.delete(roomData.ownerId);
        roomData.state = ROOM_STATE.WAIT;
      }

      logger.info('[ leave ] ====> success');

      return ResponseHelper.success(roomData);
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

      if (roomData.state !== ROOM_STATE.WAIT && roomData.state !== ROOM_STATE.PREPARE) {
        logger.error('[ updateReady ] ====> state must be wait or prepare', { sessionId });
        return ResponseHelper.fail(config.FAIL_CODE.INVALID_ROOM_STATE);
      }

      //* 준비를 취소한 경우 대기방 상태 변경
      if (roomData.state === ROOM_STATE.PREPARE && !isReady) {
        roomData.state = ROOM_STATE.WAIT;
      }

      //* 준비한 유저 업데이터
      if (isReady) {
        roomData.readyUsers.add(sessionId);
      } else {
        roomData.readyUsers.delete(sessionId);
      }

      //* 모든 유저가의 준비 상태 체크
      const allUsersReady = Array.from(roomData.users.keys())
        .filter((id) => id !== roomData.ownerId)
        .every((id) => roomData.readyUsers.has(id));

      //* 대기방 상태 업데이트
      roomData.state = allUsersReady ? ROOM_STATE.PREPARE : ROOM_STATE.WAIT;

      logger.info('[ updateReady ] ====> success');

      return ResponseHelper.success(isReady, { state: roomData.state });
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
    return [ROOM_STATE.WAIT, ROOM_STATE.PREPARE, ROOM_STATE.BOARD, ROOM_STATE.MINI].includes(state);
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
      state: ROOM_STATE.WAIT,
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
    if (!roomData || !roomData.users) {
      return [];
    }

    const otherIds = Array.from(roomData.users)
      .filter((user) => user.sessionId !== excludeSessionId)
      .map((user) => user.sessionId);

    return otherIds;
  }
}

export default Room;
