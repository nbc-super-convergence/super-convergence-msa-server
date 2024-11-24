import Room from '../models/room.class.js';
import { v4 as uuidv4 } from 'uuid';

class RoomManager {
  constructor() {
    if (RoomManager.instance) {
      return RoomManager.instance;
    }
    /** @type {Map<string, Room>} roomId -> Room */
    this.rooms = new Map();
    /** @type {Map<string, string>} userId -> roomId */
    this.userRooms = new Map(); // 유저가 참여한 대기방

    RoomManager.instance = this;
  }

  /**
   * RoomManager 인스턴스 가져오기
   * @returns {RoomManager}
   */
  static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * 대기방 생성
   * @param {UserData} userData - 생성할 방장 정보
   * @param {string} name - 대기방 이름
   * @returns {RoomResponse} 생성 결과
   */
  createRoom(userData, roomName) {
    const roomId = uuidv4();
    const room = new Room(roomId, userData.userId, roomName);
    room.users.set(userData.userId, userData);

    this.rooms.set(roomId, room);
    this.userRooms.set(userData.userId, roomId);

    return { success: true, data: room.getRoomData(), failCode: 0 };
  }

  /**
   * 대기방 참가
   * @param {UserData} userData - 참가할 유저 정보
   * @param {string} roomId - 방 ID
   * @returns {RoomResponse} 참가 결과
   */
  joinRoom(userData, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, data: null, failCode: 1 };
    }

    if (this.userRooms.has(userData.userId)) {
      return { success: false, data: null, failCode: 1 };
    }

    if (room.users.size >= room.maxUsers) {
      return { success: false, data: null, failCode: 1 };
    }

    if (room.state !== 'wait') {
      return { success: false, data: null, failCode: 1 };
    }

    const result = room.joinUser(userData);
    if (result.success) {
      this.userRooms.set(userData.userId, roomId);
    }

    return result;
  }

  /**
   * 대기방 퇴장
   * @param {string} userId - 퇴장할 유저 ID
   * @returns {RoomResponse} 퇴장 결과
   */
  leaveRoom(userId) {
    const room = this.getRoomByUserId(userId);
    if (!room) {
      return { success: false, data: null, failCode: 1 };
    }

    const result = room.leaveUser(userId);
    if (result.success) {
      this.userRooms.delete(userId);

      // 방장이 나간 경우
      if (room.ownerId === userId && room.users.size > 0) {
        const newOwnerId = Array.from(room.users.keys())[0];
        room.changeOwner(newOwnerId);
      }

      // 빈 방이 된 경우
      if (room.isEmpty()) {
        this.rooms.delete(room.id);
      }
    }

    return result;
  }

  /**
   * 대기방 목록 조회
   * @returns {RoomResponse} 대기방 목록
   */
  getRoomList() {
    const rooms = Array.from(this.rooms.values()).map((room) => room.getRoomData());
    if (!rooms) {
      return { success: false, data: [], failCode: 1 };
    }

    return {
      success: true,
      data: rooms,
      failCode: 0,
    };
  }

  /**
   * 유저의 준비 상태 설정
   * @param {string} userId - 준비/취소할 유저 ID
   * @param {boolean} isReady - true: 준비, false: 준비 취소
   * @returns {RoomResponse} 준비 결과
   */
  updateReady(userId, isReady) {
    const room = this.getRoomByUserId(userId);
    if (!room) {
      return { success: false, data: { isReady: false }, failCode: 1 };
    }

    return room.updateReady(userId, isReady);
  }

  /**
   * 대기방 상태 변경
   * @param {string} roomId - 대기방 ID
   * @param {string} state - 변경할 상태
   */
  updateRoomState(roomId, state) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    room.updateState(state);
  }

  /**
   * 대기방 설정 변경
   * @param {string} roomId
   * @param {Object} info
   */
  updateRoomInfo(roomId, info) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.updateInfo(info);
  }

  /**
   * 유저 ID로 대기방 조회
   * @param {string} userId - 조회할 유저 ID
   * @returns {Room} room - 대기방
   */
  getRoomByUserId(userId) {
    const roomId = this.userRooms.get(userId);
    if (!roomId) {
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    return room;
  }

  /**
   * 유저 ID로 대기방 ID 조회
   * @param {string} userId - 조회할 유저 ID
   * @returns {string} roomId - 대기방 ID
   */
  getRoomIdByUserId(userId) {
    const roomId = this.userRooms.get(userId);
    if (!roomId) {
      return;
    }

    return roomId;
  }
}

const roomManagerInstance = RoomManager.getInstance();
Object.freeze(roomManagerInstance);

export default roomManagerInstance;
