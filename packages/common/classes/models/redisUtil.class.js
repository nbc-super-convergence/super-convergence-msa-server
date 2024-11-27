/**
 * @typedef userdata
 * @property {string} loginId
 * @property {string} nickname
 */

/**
 * @typedef locationField
 * @property {string} lobbyId
 * @property {string} roomId
 * @property {string} boardId
 * @property {string} miniGameId
 */

/**
 * @typedef room
 * @property {string} roomId
 * @property {string} ownerSessionId
 * @property {string} roomName
 * @property {string} lobbyId
 * @property {string} state
 * @property {string} users
 * @property {string} maxUser
 * @property {string} readyUsers
 */

class RedisUtil {
  constructor(redisClient) {
    this.client = redisClient;
    this.prefix = {
      USER: 'user',
      LOCATION: 'location',
      LOBBY_USERS: 'lobbyUsers',
      LOBBY_ROOM_LIST: 'lobbyRoomList',
      ROOM: 'room',
    };
    console.log('Redis prefix:', this.prefix);
    this.expire = 60 * 60;
  }
  //* 유저 위치
  /**
   * 유저의 위치 데이터 등록
   * @param {string} sessionId
   * @param {string} location
   * @param {string} locationId
   */
  async createUserLocation(sessionId, location, locationId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    await this.client.hset(key, location, locationId);
    await this.client.expire(key, this.expire);
  }

  /**
   * 유저의 위치 데이터 삭제
   * @param {string} sessionId
   */
  async deleteUserLocation(sessionId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    await this.client.del(key);
  }

  /**
   * 유저의 특정 위치 데이터만 삭제
   * @param {string} sessionId
   * @param {string} locationField
   */
  async deleteUserLocationField(sessionId, locationField) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    await this.client.hdel(key, locationField);
  }

  /**
   * 유저의 특정 위치 데이터만 수정
   * @param {string} sessionId
   * @param {string} locationField
   * @param {string} locationId
   */
  async updateUserLocationField(sessionId, locationField, locationId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    await this.client.hset(key, locationField, locationId);
    await this.client.expire(key, this.expire);
  }

  /**
   * 유저의 특정 위치 데이터만 조회
   * @param {string} sessionId
   * @param {string} locationField
   * @returns {string} data
   */
  async getUserLocationField(sessionId, locationField) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    const data = await this.client.hget(key, locationField);
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * 유저의 위치 데이터 조회
   * @param {string} sessionId
   * @returns {locationField} data
   */
  async getUserLocation(sessionId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    const data = await this.client.hgetall(key);
    if (!data) {
      return null;
    }

    return data;
  }

  //* 유저 데이터
  /**
   * 세션에 유저 데이터 등록
   * @param {string} sessionId
   * @param {userdata} userData
   */
  async createUserToSession(sessionId, userData) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.hset(key, {
      loginId: userData.loginId,
      nickname: userData.nickname,
    });
    await this.client.expire(key, this.expire);
  }

  /**
   * 유저 데이터 삭제
   * @param {string} sessionId
   */
  async deleteUserToSession(sessionId) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.del(key);
  }

  /**
   * 유저 데이터 중 하나의 필드만 수정
   * @param {string} sessionId
   * @param {userdata} userField
   * @param {string} value
   */
  async updateUserToSessionfield(sessionId, userField, value) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.hset(key, userField, value);
    await this.client.expire(key, this.expire);
  }

  /**
   * 유저 데이터 중 하나의 필드만 조회
   * @param {string} sessionId
   * @param {userdata} userField
   * @returns {string} data
   */
  async getUserToSessionfield(sessionId, userField) {
    const key = `${this.prefix.USER}:${sessionId}`;
    const data = await this.client.hget(key, userField);
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * 세션의 유저 데이터 조회
   * @param {string} sessionId
   * @returns {userdata} userData
   */
  async getUserToSession(sessionId) {
    const key = `${this.prefix.USER}:${sessionId}`;
    const userData = await this.client.hgetall(key);
    if (!userData) {
      return null;
    }

    return {
      loginId: userData.loginId,
      nickname: userData.nickname,
    };
  }

  //* 로비 데이터
  /**
   * 로비에 접속한 유저 추가
   * @param {string} sessionId
   * @param {string} lobbyId
   */
  async addLobbyUsers(sessionId, lobbyId) {
    const key = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
    await this.client.sadd(key, sessionId);
    await this.client.expire(key, this.expire);
  }

  /**
   * 로비에 접속 중인 유저 목록 조회
   * @param {string} lobbyId - 로비 ID
   * @returns {Array<userdata>} userData
   */
  async getLobbyUsers(lobbyId) {
    const key = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
    const users = await this.client.smembers(key);
    if (!users) {
      return null;
    }

    return users;
  }

  /**
   * 로비에 접속 중인 유저 삭제
   * @param {string} sessionId
   * @param {string} lobbyId
   */
  async deleteLobbyUser(sessionId, lobbyId) {
    const key = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
    await this.client.srem(key, sessionId);
  }

  //* 룸 데이터

  async getRoomsByLobby(lobbyId) {
    const roomKeys = await this.client.smembers(`${this.prefix.LOBBY_ROOM_LIST}:${lobbyId}`);
    if (!roomKeys || roomKeys.length === 0) return [];

    const roomIds = roomKeys.map((key) => key.replace(`${this.prefix.ROOM}:`, ''));
    const rooms = await Promise.all(roomIds.map((roomId) => this.getRoom(roomId)));

    return rooms.filter((room) => room !== null);
  }

  /**
   * 대기방 생성
   * @param {room} room
   * @param {string} sessionId
   */
  async createRoom(room) {
    const key = `${this.prefix.ROOM}:${room.roomId}`;
    const exists = await this.client.exists(key);
    if (exists) {
      return false;
    }

    await this.client.hset(key, {
      roomId: room.roomId,
      ownerId: room.ownerId,
      name: room.name,
      state: room.state,
      lobbyId: room.lobbyId,
      users: room.users,
      maxUser: room.maxUser,
      readyUsers: room.readyUsers,
    });
    await this.client.expire(key, this.expire);
    await this.client.sadd(`${this.prefix.LOBBY_ROOM_LIST}:${room.lobbyId}`, key);
  }

  /**
   * 대기방 정보 조회
   * @param {string} roomId
   * @returns {room} room
   */
  async getRoom(roomId) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    console.log('Redis Key:', key);
    const roomData = await this.client.hgetall(key);
    if (!roomData) {
      return null;
    }

    return {
      roomId: roomData.roomId,
      ownerId: roomData.ownerId,
      name: roomData.name,
      state: roomData.state,
      lobbyId: roomData.lobbyId,
      users: roomData.users,
      maxUser: roomData.maxUser,
      readyUsers: roomData.readyUsers,
    };
  }

  /**
   * 대기방의 하나의 필드만 수정
   * @param {string} roomId
   * @param {room} roomField
   * @param {string} value
   */
  async updateRoomField(roomId, roomField, value) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    await this.client.hset(key, roomField, value);
    await this.client.expire(key, this.expire);
  }

  /**
   *대기방의 여러개의 필드 수정
   * @param {string} roomId
   * @param {room} roomFields
   * @returns
   */
  async updateRoomFields(roomId, roomFields) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    await this.client.hset(key, roomFields);
    await this.client.expire(key, this.expire);
  }

  /**
   * 대기방의 하나의 필드의 값 조회
   * @param {string} roomId
   * @param {room} roomField
   * @returns {string} data
   */
  async getRoomField(roomId, roomField) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    const data = await this.client.hget(key, roomField);
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * 대기방 삭제
   * @param {string} roomId
   */
  async deleteRoom(roomId) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    const roomData = await this.getRoom(roomId);
    if (roomData) {
      await Promise.all([
        this.client.del(key),
        this.client.srem(`${this.prefix.LOBBY_ROOM_LIST}:${roomData.lobbyId}`, key),
      ]);
    }
  }
}

export default RedisUtil;
