import Room from '../models/room.class.js';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../init/redis.js';
import RoomDTO from '../models/room.dto.js';
import { config } from '@repo/common/config';
import { ResponseHelper } from '@repo/common/classes';
import RoomValidator from '../models/room.validator.js';
import { logger } from '../../utils/logger.utils.js';

const { FAIL_CODE, ROOM_STATE } = config;

class RoomManager {
  constructor() {
    if (RoomManager.instance) {
      return RoomManager.instance;
    }
    RoomManager.instance = this;
  }

  static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * 새로운 대기방을 생성
   * @param {string} sessionId - 대기방을 생성하는 유저의 세션 ID
   * @param {string} roomName - 생성할 대기방 이름
   * @returns {RoomReponse} 대기방 생성 결과
   */
  async createRoom(sessionId, roomName) {
    try {
      //* 유저 세션 검증
      const userData = await RoomValidator.userSession(sessionId);
      if (!userData) {
        logger.error('[ createRoom ] ====> userData is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_FOUND);
      }

      //* 로비에 있는지 검증
      const lobbyId = await RoomValidator.userLobbyLocation(sessionId);
      if (!lobbyId) {
        logger.error('[ createRoom ] ====> lobbyId is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.WRONG_LOBBY);
      }

      //* 대기방 생성
      const roomData = Room.createRoomData(uuidv4(), sessionId, roomName, lobbyId);
      const redisData = RoomDTO.toRedis(roomData);
      await redis.transaction.createRoom(redisData, sessionId);

      logger.info('[ createRoom ] ====> success');

      return ResponseHelper.success(await RoomDTO.toResponse(roomData));
    } catch (error) {
      logger.error('[ createRoom ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 대기방에 유저 입장
   * @param {string} sessionId - 입장하려는 유저의 세션 ID
   * @param {string} roomId - 입장하려는 대기방 ID
   * @returns {RoomReponse} 입장 결과
   */
  async joinRoom(sessionId, roomId) {
    try {
      //* 이미 대기방에 있는 유저인지 검증
      const currentRoomId = await RoomValidator.userRoomLocation(sessionId);
      if (currentRoomId) {
        logger.error('[ joinRoom ] ====> user is already in another room', {
          sessionId,
          currentRoomId,
        });
        return ResponseHelper.fail(FAIL_CODE.USER_ALREADY_IN_ROOM);
      }

      //* 입장하려는 대기방이 있는지 검증
      const redisData = await RoomValidator.roomExists(roomId);
      if (!redisData) {
        logger.error('[ joinRoom ] ====> redisData is undefined', { roomId });
        return ResponseHelper.fail(FAIL_CODE.ROOM_NOT_FOUND);
      }

      //* 대기방이 있는 로비에 위치하는 유저인지 검증
      const matched = await RoomValidator.lobbyMatch(sessionId, redisData.lobbyId);
      if (!matched) {
        logger.error('[ joinRoom ] ====> user is in another lobby', { sessionId, matched });
        return ResponseHelper.fail(FAIL_CODE.WRONG_LOBBY);
      }

      //* 유저 세션 검증
      const userData = await RoomValidator.userSession(sessionId);
      if (!userData) {
        logger.error('[ joinRoom ] ====> userData is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_FOUND);
      }

      //* 입장
      const roomData = RoomDTO.fromRedis(redisData);
      const result = Room.join(roomData, sessionId);

      if (!result.success) return result;
      await redis.transaction.joinRoom(roomId, RoomDTO.toRedis(result.data), sessionId);

      logger.info('[ joinRoom ] ====> success');

      const responseData = await RoomDTO.toResponse(result.data);
      return ResponseHelper.success(responseData);
    } catch (error) {
      logger.error('[ joinRoom ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 대기방에서 유저 퇴장
   * @param {string} sessionId - 퇴장하려는 유저의 세션 ID
   * @returns {RoomReponse} 퇴장 결과
   */
  async leaveRoom(sessionId) {
    try {
      //* 대기방에 있는 유저가 맞는지 검증
      const roomId = await RoomValidator.userRoomLocation(sessionId);
      if (!roomId) {
        logger.error('[ leaveRoom ] ====> not a user in the room', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_IN_ROOM);
      }

      //* 유저 세션 검증
      const userData = await RoomValidator.userSession(sessionId);
      if (!userData) {
        logger.error('[ leaveRoom ] ====> userData is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_FOUND);
      }

      //* 대기방이 있는지 검증
      const redisData = await RoomValidator.roomExists(roomId);
      if (!redisData) {
        logger.error('[ leaveRoom ] ====> redisData is undefined', { roomId });
        return ResponseHelper.fail(FAIL_CODE.ROOM_NOT_FOUND);
      }

      //* 퇴장
      const roomData = RoomDTO.fromRedis(redisData);
      const result = Room.leave(roomData, sessionId);

      if (!result.success) return result;

      if (roomData.users.size === 0) {
        //* 남은 인원이 없으면 대기방 삭제
        await redis.transaction.deleteRoom(roomId, roomData.lobbyId);
      } else {
        await redis.updateRoomFields(roomId, RoomDTO.toRedis(roomData));
      }
      await redis.deleteUserLocationField(sessionId, 'room');

      logger.info('[ leaveRoom ] ====> success');

      const responseData = await RoomDTO.toResponse(result.data);
      return ResponseHelper.success(responseData);
    } catch (error) {
      logger.error('[ leaveRoom ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 유저의 준비 상태 변경
   * @param {string} sessionId - 준비 상태를 변경할 유저의 세션 ID
   * @param {boolean} isReady - 준비 상태 여부
   * @returns {RoomReponse} 준비 상태 변경 결과
   */
  async updateReady(sessionId, isReady) {
    try {
      //* 대기방에 있는 유저가 맞는지 검증
      const roomId = await RoomValidator.userRoomLocation(sessionId);
      if (!roomId) {
        logger.error('[ updateReady ] ====> roomId is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_IN_ROOM);
      }

      //* 유저 세션 검증
      const userData = await RoomValidator.userSession(sessionId);
      if (!userData) {
        logger.error('[ updateReady ] ====> userData is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_FOUND);
      }

      //* 대기방이 있는지 검증
      const redisData = await RoomValidator.roomExists(roomId);
      if (!redisData) {
        logger.error('[ updateReady ] ====> redisData is undefined', { roomId });
        return ResponseHelper.fail(FAIL_CODE.ROOM_NOT_FOUND);
      }

      //* 현재 대기방에 있는 유저가 맞는지 검증
      if (roomId !== redisData.roomId) {
        logger.error('[ updateReady ] ====> invalid user', { roomId });
        return ResponseHelper.fail(FAIL_CODE.USER_NOT_IN_ROOM);
      }

      const roomData = RoomDTO.fromRedis(redisData);

      // * 방장은 준비 불가
      if (roomData.ownerId === sessionId) {
        logger.error('[ updateReady ] ====> owner can not prepare', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.OWNER_CANNOT_READY);
      }

      //* 준비 상태 설정
      const result = Room.updateReady(roomData, sessionId, isReady);

      if (!result.success) return result;

      await redis.updateRoomFields(roomId, RoomDTO.toRedis(roomData));

      logger.info('[ updateReady ] ====> success');

      const responseData = await RoomDTO.toResponse(roomData);
      return ResponseHelper.success(result.data, {
        state: result.state,
        userData: responseData.users.find((user) => user.sessionId === sessionId),
      });
    } catch (error) {
      logger.error('[ updateReady ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  /**
   * 로비의 대기방 목록 조회
   * @param {string} sessionId - 조회하는 유저의 세션 ID
   * @returns {RoomReponse} 대기방 목록 조회 결과
   */
  async getRoomList(sessionId) {
    try {
      //* 로비가 존재하는지 검증
      const lobbyId = await RoomValidator.userLobbyLocation(sessionId);
      if (!lobbyId) {
        logger.error('[ getRoomList ] ====> lobbyId is undefined', { sessionId });
        return ResponseHelper.fail(FAIL_CODE.WRONG_LOBBY);
      }

      //* 로비에 있는 대기방 목록 조회
      const rooms = await redis.getRoomsByLobby(lobbyId);

      //* 각 방의 상세 정보를 포함한 응답 생성
      const roomResponses = await Promise.all(
        rooms.map(async (room) => {
          const roomData = RoomDTO.fromRedis(room);
          if (!roomData) return null;
          return await RoomDTO.toResponse(roomData);
        }),
      );

      const validRoomResponses = roomResponses.filter(
        (room) =>
          room.state !== ROOM_STATE.BOARD && room.state !== ROOM_STATE.MINI && room !== null,
      );
      logger.info('[ getRoomList ] ====> success', { roomCount: validRoomResponses.length });

      return ResponseHelper.success(validRoomResponses);
    } catch (error) {
      logger.error('[ getRoomList ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }

  //! 사용 중이지 않음 추후 추가될 가능성이 있음
  /**
   * 대기방 상태 변경
   * @param {string} roomId - 상태를 변경할 방 ID
   * @param {RoomState} state - 변경할 상태
   * @returns {RoomReponse} 상태 변경 결과
   */
  async updateRoomState(roomId, state) {
    try {
      //* 대기방의 상태값이 맞는지 확인
      if (!Room.validateState(state)) {
        logger.error('[ updateRoomState ] ====> validateState fail', { state });
        return ResponseHelper.fail(FAIL_CODE.INVALID_ROOM_STATE);
      }

      //* 대기방이 존재하는지 확인
      const redisData = await RoomValidator.roomExists(roomId);
      if (!redisData) {
        logger.error('[ updateRoomState ] ====> redisData is undefined', { roomId });
        return ResponseHelper.fail(FAIL_CODE.ROOM_NOT_FOUND);
      }

      //* 상태 변경
      const roomData = RoomDTO.fromRedis(redisData);
      roomData.state = state;

      await redis.updateRoomFields(roomId, RoomDTO.toRedis(roomData));

      logger.info('[ updateRoomState ] ====> success');

      return ResponseHelper.success(RoomDTO.toResponse(roomData));
    } catch (error) {
      logger.error('[ updateRoomState ] ====> unknown error', error);
      return ResponseHelper.fail();
    }
  }
}

const roomManagerInstance = RoomManager.getInstance();
Object.freeze(roomManagerInstance);

export default roomManagerInstance;
