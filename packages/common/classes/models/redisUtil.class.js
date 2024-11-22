class RedisUtil {
  constructor(redisClient) {
    this.client = redisClient;
    this.prefix = {
      USER: 'user',
      LOBBY_USER: 'lobbyUser',
      LOBBY_ROOM: 'lobbyRoom',
      ROOM: 'room',
    };
  }

  // 유저 데이터
  /**
   * 세션에 유저 데이터 등록
   * @param {Object} userData
   * @typeDef userData: { userId: String, nickname: String, location: String }
   */
  async createUserToSession(userData) {
    const key = `${this.prefix.USER}:${userData.userId}`;
    await this.client.hset(key, {
      userId: userData.userId,
      nickname: userData.nickname,
      location: userData.location,
    });
    await this.client.expire(key, 1800);
  }

  /**
   * 유저 데이터 삭제
   * @param {String} userId
   */
  async deleteUserToSession(userId) {
    const key = `${this.prefix.USER}:${userId}`;
    await this.client.del(key);
  }

  /**
   * 유저 데이터 중 하나의 필드만 수정
   * @param {String} userId
   * @param {String} Enum field
   * @param {String} value
   * @typeDef field = "userId" || "nickname" || "location"
   */
  async updateUserToSessionField(userId, field, value) {
    const key = `${this.prefix.USER}:${userId}`;
    await this.client.hset(key, field, value);
    await this.client.expire(key, 1800);
  }

  /**
   * 유저 데이터 중 하나의 필드만 조회
   * @param {String} userId
   * @param {String} Enum field
   * @returns {String} field value
   * @typeDef field = "userId" || "nickname" || "location"
   * @typeDef location = "lobby" || "room" || "game" || "mini"
   */
  async getUserToSessionField(userId, field) {
    const key = `${this.prefix.USER}:${userId}`;
    const data = await this.client.hget(key, field);
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * 세션의 유저 데이터 조회
   * @param {String} userId
   * @returns {Object} userData
   * @typeDef userData: { userId: String, nickname: String, location: String }
   */
  async getUserToSession(userId) {
    const key = `${this.prefix.USER}:${userId}`;
    const userData = await this.client.hget(key);
    if (!userData) {
      return null;
    }

    return {
      userId: userData.userId,
      nickname: userData.nickname,
      location: userData.location,
    };
  }

  /**
   * 세션의 유저 데이터 조회
   * @param {String} userId
   * @returns {Object} userData
   * @typeDef userData: { userId: String, nickname: String, location: String }
   */
  async getUserToSession(userId) {
    const key = `${this.prefix.USER}:${userId}`;
    const userData = await this.client.hget(key);
    if (!userData) {
      return null;
    }

    return {
      userId: userData.userId,
      nickname: userData.nickname,
      location: userData.location,
    };
  }

  // 로비 데이터
  /**
   * 로비에 접속한 유저 추가
   * @param {String} lobbyId
   * @param {String} userId
   */
  async addLobbyUser(lobbyId, userId) {
    const key = `${this.prefix.LOBBY_USER}:${lobbyId}`;
    await this.client.sadd(key, userId);
    await this.client.expire(key, 1800);
  }

  /**
   * 로비에 접속 중인 유저 목록 조회
   * @param {String} lobbyId
   * @returns {Array} userData
   * @typeDef userData: { userId: String, nickname: String, location: String }
   */
  async getLobbyUsers(lobbyId) {
    const key = `${this.prefix.LOBBY_USER}:${lobbyId}`;
    const users = await this.client.smembers(key);
    if (!users) {
      return null;
    }

    return users;
  }

  // 룸 데이터
  /**
   * 대기방 생성
   * @param {String} lobbyId
   * @param {Object} room
   * @param {String} userId
   * @typeDef room: { ownerId: String, name: String, state: String, maxUser: Number, readyUsers: Object }
   */
  async createRoom(lobbyId, room, userId) {
    const key = `${this.prefix.ROOM}:${room.roomId}`;
    await this.client.hset(key, {
      ownerId: userId,
      name: room.name,
      state: room.state,
      maxUser: room.maxUser,
      readyUsers: room.readyUsers,
    });
    await this.client.expire(key, 1800);
    await this.client.sadd(`${this.prefix.LOBBY_ROOM}:${lobbyId}`, key);
  }

  /**
   * 대기방의 하나의 필드만 수정
   * @param {String} roomId
   * @param {String} Enum field
   * @param {String || Number || Array} value
   * @typeDef field = "ownerId" || "name" || "state" || "maxUser" || "readyUsers"
   */
  async updateRoomField(roomId, field, value) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    await this.client.hset(key, field, value);
    await this.client.expire(key, 1800);
  }

  /**
   * 대기방의 하나의 필드의 값 조회
   * @param {String} roomId
   * @param {String} Enum field
   * @returns {String || Number || Array} value
   * @typeDef field = "ownerId" || "name" || "state" || "maxUser" || "readyUsers"
   */
  async getRoomField(roomId, field) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    const data = await this.client.hget(key, field);
    if (!data) {
      return null;
    }

    return data;
  }

  /**
   * 대기방 삭제
   * @param {String} roomId
   */
  async deleteRoom(roomId) {
    const key = `${this.prefix.ROOM}:${roomId}`;
    await this.client.del(key);
  }
}

export default RedisUtil;
