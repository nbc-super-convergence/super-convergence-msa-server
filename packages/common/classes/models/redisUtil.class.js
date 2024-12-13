import redisTransaction from './redisTransaction.class.js';

/**
 * @typedef userdata
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

/**
 * @typedef BoardPlayerInfo
 * @property {number} gold
 * @property {number} trophy
 * @property {number} tileLocation
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
      LOGIN: 'login',
      BOARD: 'board',
      BOARD_PLAYER_INFO: 'boardPlayerInfo',
      BOARD_PLAYERS: 'boardPlayers',
      BOARD_PURCHASE_TILE_MAP: 'purchaseTileMap',
      BOARD_PURCHASE_TILE_HISTORY: 'purchaseTileHistory',
      BOARD_DART_HISTORY: 'boardDartHistory',
      BOARD_DART_INFO: 'boardDartInfo',
      LOCK: 'lock',
    };

    this.expire = 60 * 60;

    this.channel = {
      BOARD: 'boardChannel',
      ICE: 'iceGameChannel',
      DANCE: 'danceGameChannel',
      BOMB: 'bombGameChannel',
      DROPPER: 'dropperGameChannel',
      DART: 'dartGameChannel',
    };

    this.transaction = new redisTransaction(this);
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
   *
   * 중복 로그인 검사 KEY 등록
   *
   */

  async createUserLogin(nickname) {
    const key = `${this.prefix.LOGIN}`;
    const result = await this.client.sadd(key, nickname);
    return result;
  }

  /**
   * 중복 로그인 검사
   */

  async getUserToLogin(nickname) {
    const key = `${this.prefix.LOGIN}`;
    const findUser = await this.client.sismember(key, nickname);
    return findUser;
  }

  /**
   * 중복 로그인 세션에서 유저 삭제
   */

  async deleteUserToLogin(nickname) {
    const key = `${this.prefix.LOGIN}`;
    await this.client.srem(key, nickname);
  }

  //* 유저 데이터
  /**
   * 세션에 유저 데이터 등록
   * @param {string} sessionId
   * @param {userdata} userData
   */
  async createUserToSession(sessionId, data) {
    const key = `${this.prefix.USER}:${sessionId}`;
    await this.client.hset(key, {
      nickname: data.nickname,
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
    const nickname = await this.client.hgetall(key);
    if (!nickname) {
      return null;
    }

    return nickname;
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
    try {
      //* 로비의 방 목록 키 조회
      const lobbyRoomListKey = `${this.prefix.LOBBY_ROOM_LIST}:${lobbyId}`;
      const roomIds = await this.client.smembers(lobbyRoomListKey);

      if (!roomIds || roomIds.length === 0) {
        console.error('[ getRoomsByLobby ] ====> no rooms found');
        return [];
      }

      //* 실제 방 ID들을 가져옴 (prefix:roomId 형태에서 roomId만 추출)
      const actualRoomIds = roomIds.map((key) => key.split(':').pop());

      //* 각 방의 데이터를 조회
      const rooms = await Promise.all(
        actualRoomIds.map(async (roomId) => {
          const roomKey = `${this.prefix.ROOM}:${roomId}`;
          const roomData = await this.client.hgetall(roomKey);

          if (!roomData || !roomData.roomId) {
            //* 유효하지 않은 방은 로비 목록에서 제거
            await this.client.srem(lobbyRoomListKey, roomKey);
            return null;
          }

          return {
            roomId: roomData.roomId,
            ownerId: roomData.ownerId,
            roomName: roomData.roomName,
            lobbyId: roomData.lobbyId,
            state: roomData.state,
            users: roomData.users,
            maxUser: roomData.maxUser,
            readyUsers: roomData.readyUsers,
          };
        }),
      );

      //* null 값 필터링
      const validRooms = rooms.filter((room) => room !== null);
      console.log('[ getRoomsByLobby ] ====> found rooms:', validRooms.length);

      return validRooms;
    } catch (error) {
      console.error('[ getRoomsByLobby ] ====> error', error);
      return [];
    }
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
      roomName: room.roomName,
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
    const roomData = await this.client.hgetall(key);
    if (!roomData) {
      return null;
    }

    return {
      roomId: roomData.roomId,
      ownerId: roomData.ownerId,
      roomName: roomData.roomName,
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

  // [ BOARD ]

  /**
   * * 보드게임 생성 및 보드게임 플레이어 추가, 보드 채널 published
   * @param {board} board
   * @returns
   */
  async createBoardGame(board) {
    const key = `${this.prefix.BOARD}:${board.boardId}`;

    const exists = await this.client.exists(key);
    if (exists) {
      return false;
    }

    await this.client.hset(key, {
      boardId: board.boardId,
      roomId: board.roomId,
      ownerId: board.ownerId,
      state: board.state,
    });
    await this.client.expire(key, this.expire);

    const playersKey = `${this.prefix.BOARD_PLAYERS}:${board.boardId}`;
    await this.client.sadd(playersKey, board.ownerId);

    // pub
    const channel = this.channel.BOARD;
    const message = board.boardId;
    await this.client.publish(channel, message);
    console.log(`[${channel}] Channel Notification Sent: [${message}]`);
  }

  async getBoardGameField(boardId, field) {
    const boardKey = `${this.prefix.BOARD}:${boardId}`;

    const result = this.client.hget(boardKey, `${field}`);

    return result;
  }

  async updateBoardGameField(boardId, field, value) {
    const boardKey = `${this.prefix.BOARD}:${boardId}`;
    await this.client.hset(boardKey, field, value);
  }

  async deleteBoardGame(boardId) {
    const boardKey = `${this.prefix.BOARD}:${boardId}`;
    await this.client.del(boardKey);
  }

  /**
   * 보드 전체 플레이어 조회
   * @param {String} boardId
   * @returns
   */
  async getBoardPlayers(boardId) {
    const key = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
    const result = this.client.smembers(key);
    return result;
  }

  /**
   * 참여한 보드게임의 플레이어 목록 조회
   * @param {String} sessionId
   * @returns
   */
  async getBoardPlayersBySessionId(sessionId) {
    const boardId = await this.getUserLocationField(sessionId, 'board');
    return await this.getBoardPlayers(boardId);
  }

  /**
   * 보드 플레이어 목록에서 제거
   * @param {String} boardId
   * @returns
   */
  async deleteBoardPlayers(boardId, sessionId) {
    const key = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
    await this.client.srem(key, sessionId);
  }

  /**
   * 보드게임 플레이어 정보 조회
   * @param {String} boardId
   * @param {String} sessionId
   * @returns {BoardPlayerInfo}
   */
  async getBoardPlayerinfo(boardId, sessionId) {
    const key = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
    return await this.client.hgetall(key);
  }

  /**
   * 보드게임 플레이어 정보 수정
   * @param {String} boardId
   * @param {String} sessionId
   * @param {BoardPlayerInfo} boardPlayerInfo
   */
  async updateBoardPlayerInfo(boardId, sessionId, boardPlayerInfo) {
    const key = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
    await this.client.hset(key, boardPlayerInfo);
  }

  /**
   * 보드게임 플레이어 정보 삭제
   * @param {String} boardId
   * @param {String} sessionId
   */
  async deleteBoardPlayerInfo(boardId, sessionId) {
    const key = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
    await this.client.del(key);
  }

  async createLockKey(key, id) {
    const lockKey = `${this.prefix.LOCK}:${key}:${id}`;
    const lockAcquired = await this.client.set(lockKey, 'LOCK', 'NX', 'EX', 5);
    return lockAcquired;
  }

  async deleteLockKey(key, id) {
    const lockKey = `${this.prefix.LOCK}:${key}:${id}`;
    await this.client.del(lockKey);
  }

  async getMiniGameChannel() {
    const key = `BOARD:MINIGAME_CHANNEL`;
    const result = await this.client.get(key);
    return result;
  }

  /**
   * 보드게임 플레이어 골드 증감
   * @param {String} boardId
   * @param {String} sessionId
   * @param {int} value
   */
  async updateBoardPlayerGold(boardId, sessionId, value) {
    const key = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
    const incGold = await this.client.hincrby(key, 'gold', value);
    if (incGold <= 0) {
      await this.client.hset(key, 'gold', 0);
    }
  }
}

export default RedisUtil;
