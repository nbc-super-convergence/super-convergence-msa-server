class redisTransaction {
  constructor(redisUtil) {
    this.redisUtil = redisUtil;
    this.client = redisUtil.client;
    this.prefix = redisUtil.prefix;
    this.expire = redisUtil.expire;
  }

  /**
   * 트랜잭션 실행을 위한 헬퍼 메소드
   * @param {Function} transactionCallback - 트랜잭션 내에서 실행할 콜백 함수
   * @returns {Promise<any>} 트랜잭션 결과
   */
  async execute(transactionCallback) {
    const multi = this.client.multi();
    try {
      await transactionCallback(multi);
      return await multi.exec();
    } catch (error) {
      await multi.discard();
      console.error('[ redisTransaction ] ===> error', error);
    }
  }

  /**
   * 로비 입장 트랜잭션
   * @param {string} sessionId
   * @param {string} lobbyId
   */
  async joinLobby(sessionId, lobbyId) {
    return this.execute(async (multi) => {
      const lobbyKey = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;

      multi.sadd(lobbyKey, sessionId);
      multi.expire(lobbyKey, this.expire);
      multi.hset(locationKey, 'lobby', lobbyId);
      multi.expire(locationKey, this.expire);
    });
  }

  /**
   * 로비 퇴장 트랜잭션
   * @param {string} sessionId
   * @param {string} lobbyId
   */
  async leaveLobby(sessionId, lobbyId) {
    return this.execute(async (multi) => {
      const lobbyKey = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;

      multi.srem(lobbyKey, sessionId);
      multi.hdel(locationKey, 'lobby');
    });
  }

  /**
   * 대기방 생성 트랜잭션
   * @param {RoomData} room
   */
  async createRoom(room, sessionId) {
    return this.execute(async (multi) => {
      const roomKey = `${this.prefix.ROOM}:${room.roomId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;
      const lobbyRoomListKey = `${this.prefix.LOBBY_ROOM_LIST}:${room.lobbyId}`;

      multi.exists(roomKey);
      multi.hset(roomKey, {
        roomId: room.roomId,
        ownerId: room.ownerId,
        roomName: room.roomName,
        state: room.state,
        lobbyId: room.lobbyId,
        users: room.users,
        maxUser: room.maxUser,
        readyUsers: room.readyUsers,
      });
      multi.expire(roomKey, this.expire);
      multi.sadd(lobbyRoomListKey, roomKey);
      multi.hset(locationKey, 'room', room.roomId);
      multi.expire(locationKey, this.expire);
    });
  }

  /**
   * 대기방 입장 트랜잭션
   * @param {string} roomId
   * @param {RoomData} room
   * @param {string} sessionId
   */
  async joinRoom(roomId, room, sessionId) {
    return this.execute(async (multi) => {
      const roomKey = `${this.prefix.ROOM}:${roomId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;

      multi.hset(roomKey, room);
      multi.expire(roomKey, this.expire);
      multi.hset(locationKey, 'room', roomId);
      multi.expire(roomKey, this.expire);
    });
  }

  /**
   * 대기방 삭제 트랜잭션
   * @param {string} roomId
   * @param {string} lobbyId
   */
  async deleteRoom(roomId, lobbyId) {
    return this.execute(async (multi) => {
      const roomKey = `${this.prefix.ROOM}:${roomId}`;
      const lobbyRoomListKey = `${this.prefix.LOBBY_ROOM_LIST}:${lobbyId}`;

      multi.del(roomKey);
      multi.srem(lobbyRoomListKey, roomKey);
    });
  }

  /**
   * 보드게임 생성 트랜잭션
   * @param {*} board
   */
  async createBoardGame(board) {
    const result = await this.execute(async (multi) => {
      const boardKey = `${this.prefix.BOARD}:${board.boardId}`;
      const playersKey = `${this.prefix.BOARD_PLAYERS}:${board.boardId}`;
      const locationKey = `${this.prefix.LOCATION}:${board.ownerId}`;

      multi.exists(boardKey);

      // * 보드 정보 저장
      multi.hset(boardKey, {
        boardId: board.boardId,
        roomId: board.roomId,
        ownerId: board.ownerId,
        state: board.state,
      });
      multi.expire(boardKey, this.expire);

      // * 보드 플레이어 저장
      multi.sadd(playersKey, board.ownerId);
      multi.expire(playersKey, this.expire);

      // * 유저 위치정보 - 보드 저장
      multi.hset(locationKey, 'board', board.boardId);
      multi.expire(locationKey, this.expire);
    });

    // * 트랜잭션 성공했을 때만 publish
    if (result) {
      const channel = this.redisUtil.channel.BOARD;
      const message = board.boardId + ':' + board.users;
      await this.client.publish(channel, message);
      console.log(`[${channel}] Channel Notification Sent: [${message}]`);
    }
  }

  /**
   * 유저 세션 생성 트랜잭션
   * @param {string} sessionId
   * @param {string} loginId
   * @param {UserData} user
   */
  async createUser(sessionId, loginId, user) {
    return this.execute(async (multi) => {
      const userKey = `${this.prefix.USER}:${sessionId}`;
      const loginKey = `${this.prefix.LOGIN}`;

      multi.hset(userKey, {
        loginId: user.loginId,
        nickname: user.nickname,
      });
      multi.expire(userKey, this.expire);
      multi.sadd(loginKey, loginId);
    });
  }

  /**
   * 유저 세션 삭제 트랜잭션
   * @param {string} sessionId
   * @param {string} loginId
   */
  async deleteUser(sessionId, loginId) {
    return this.execute(async (multi) => {
      const userKey = `${this.prefix.USER}:${sessionId}`;
      const loginKey = `${this.prefix.LOGIN}`;

      multi.del(loginKey, loginId);
      multi.del(userKey);
    });
  }
}

export default redisTransaction;
