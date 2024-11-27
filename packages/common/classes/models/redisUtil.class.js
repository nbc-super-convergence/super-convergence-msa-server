/**
 * @typedef userdata
 * @property {string} loginId
 * @property {string} nickname
 * @property {string} location
 */

/**
 * @typedef userField
 * @property {string} loginId
 * @property {string} nickname
 * @property {string} location
 */

/**
 * @typedef roomField
 * @property {string} roomId
 * @property {string} ownerId
 * @property {string} roomName
 * @property {string} state
 * @property {number} maxUser
 * @property {set} readyUsers
 */

/**
 * @typedef locationField
 * @property {string} lobby
 * @property {string} roomId
 * @property {string} boardId
 * @property {string} miniGameId
 */

/**
 * @typedef room
 * @property {string} roomId
 * @property {string} ownerSessionId
 * @property {string} roomName
 * @property {string} state
 * @property {number} maxUser
 * @property {set} readyUsers
 */

class RedisUtil {
  constructor(redisClient) {
    this.client = redisClient;
    this.prefix = {
      USER: 'user',
      LOCATION: 'location',
      LOBBY_USERS: 'lobbyUsers',
      ROOM_LIST: 'roomList',
      ROOM: 'room',
      LOGIN: 'login',
    };
  }
  // 유저 위치
  /**
   * 유저의 위치 데이터 등록
   * @param {string} sessionId
   * @param {string} location
   * @param {string} locationId
   */
  async createUserLocation(sessionId, location, locationId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    await this.client.hset(key, location, locationId);
    await this.client.expire(key, 60 * 60);
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
    await this.client.expire(key, 60 * 60);
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
    const data = await this.client.hget(key);
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   *
   * 중복 로그인 검사 KEY 등록
   *
   */

  async createUserLogin(loginId) {
    const key = `${this.prefix.LOGIN}`;
    await this.client.sadd(key, loginId);
  }

  /**
   * 중복 로그인 검사
   */

  async getUserToLogin(loginId) {
    const key = `${this.prefix.LOGIN}`;
    const findUser = await this.client.sismember(key, loginId);
    return findUser;
  }

  /**
   * 중복 로그인 세션에서 유저 삭제
   */

  async deleteUserToLogin(loginId) {
    const key = `${this.prefix.LOGIN}`;
    await this.client.srem(key, loginId);
  }

  // 유저 위치
  /**
   * 유저의 위치 데이터 등록
   * @param {string} sessionId
   * @param {string} location
   * @param {string} locationId
   */
  async createUserLocation(sessionId, location, locationId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    await this.client.hset(key, location, locationId);
    await this.client.expire(key, 60 * 60);
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
   * 세션에 유저 데이터 등록
   * @param {string} sessionId
   * @param {userdata} userData
   */
  async createUserToSession(sessionId, userData) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.hset(key, {
      loginId: userData.loginId,
      nickname: userData.nickname,
      location: userData.location,
    });
    await this.client.expire(key, 60 * 60);
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
    await this.client.expire(key, 60 * 60);
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
   * 유저 데이터 중 하나의 필드만 수정
   * @param {string} sessionId
   * @param {userField} userField
   * @param {string} value
   */
  async updateUserToSessionfield(sessionId, userField, value) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.hset(key, userField, value);
    await this.client.expire(key, 60 * 60);
  }

  /**
   * 유저 데이터 중 하나의 필드만 조회
   * @param {string} sessionId
   * @param {userField} userField
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
   * 유저의 위치 데이터 조회
   * @param {string} sessionId
   * @returns {locationField} data
   */
  async getUserLocation(sessionId) {
    const key = `${this.prefix.LOCATION}:${sessionId}`;
    const data = await this.client.hget(key);
    if (!data) {
      return null;
    }

    return data;
  }

  // 유저 데이터
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
      location: userData.location,
    });
    await this.client.expire(key, 60 * 60 * 24);
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
   * @param {userField} userField
   * @param {string} value
   */
  async updateUserToSessionfield(sessionId, userField, value) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.hset(key, userField, value);
    await this.client.expire(key, 60 * 60 * 24);
  }

  /**
   * 유저 데이터 중 하나의 필드만 조회
   * @param {string} sessionId
   * @param {userField} userField
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
    const userData = await this.client.hget(key);
    if (!userData) {
      return null;
    }

    return {
      loginId: userData.loginId,
      nickname: userData.nickname,
      location: userData.location,
    };
  }

  // 로비 데이터
  /**
   * 로비에 접속한 유저 추가
   * @param {string} sessionId
   */
  async addLobbyUsers(sessionId) {
    const key = `${this.prefix.LOBBY_USERS}`;
    await this.client.sadd(key, sessionId);
  }

  /**
   * 로비에 접속 중인 유저 목록 조회
   * @returns {Array<userdata>} userData
   */
  async getLobbyUserss() {
    const key = `${this.prefix.LOBBY_USERS}`;
    const users = await this.client.smembers(key);
    if (!users) {
      return null;
    }

    return users;
  }

  // 룸 데이터
  /**
   * 대기방 생성
   * @param {room} room
   * @param {string} sessionId
   */
  async createRoom(room, sessionId) {
    const key = `${this.prefix.ROOM}:${room.roomId}`;
    await this.client.hset(key, {
      ownerId: sessionId,
      name: room.name,
      state: room.state,
      maxUser: room.maxUser,
      readyUsers: room.readyUsers,
    });
    await this.client.expire(key, 60 * 60);
    await this.client.sadd(`${this.prefix.ROOM_LIST}`, key);
  }

  /**
   * 대기방의 하나의 필드만 수정
   * @param {string} roomId
   * @param {roomField} roomField
   * @param {string | number | set} value
   */
  async updateRoomfield(roomId, roomField, value) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    await this.client.hset(key, roomField, value);
    await this.client.expire(key, 60 * 60);
  }

  /**
   * 대기방의 하나의 필드의 값 조회
   * @param {string} roomId
   * @param {roomField} roomField
   * @returns {string | number | set} data
   */
  async getRoomfield(roomId, roomField) {
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
    await this.client.del(key);
  }
}

export default RedisUtil;
