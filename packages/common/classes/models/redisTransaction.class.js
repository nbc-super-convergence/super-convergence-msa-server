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

      const users = JSON.parse(board.users);
      users.forEach((sessionId) => {
        console.log('[ createBoardGame : for ] sessionId ===> ', sessionId);

        // * 보드 플레이어 목록 저장
        multi.sadd(playersKey, sessionId);
        multi.expire(playersKey, this.expire);

        // * 보드 플레이어 정보 저장
        // 골드, 트로피, 플레이어 타일 위치,
        const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${board.boardId}:${sessionId}`;
        multi.hset(boardPlayerInfoKey, {
          gold: 10, // TODO: 게임 데이터에서 파싱?
          trophy: 0,
          tileLocation: 0, // TODO: 시작 위치?
        });
      });

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
        nickname: user.nickname,
      });
      multi.expire(userKey, this.expire);
      multi.sadd(loginKey, user.nickname);
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

  /**
   * 보드 - 타일 구매 정보 및 이력 저장
   * @param {String} boardId
   * @param {String} sessionId
   * @param {Number} tile
   */
  async createPurchaseTileInfo(boardId, sessionId, tile) {
    return this.execute(async (multi) => {
      /**
       * 1. 타일 주인 매핑 정보 저장 hash
       * 2. 구매 이력 정보 저장 list
       */
      const mapKey = `${this.prefix.BOARD_PURCHASE_TILE_MAP}:${boardId}`;
      const historyKey = `${this.prefix.BOARD_PURCHASE_TILE_HISTORY}:${boardId}:${sessionId}`;

      multi.hset(mapKey, tile, sessionId);
      multi.sadd(historyKey, tile);
    });
  }

  /**
   * 보드 - 타일 페널티에 의한 결과를 반영한 플레이어들 정보 반환
   * @param {String} boardId
   * @param {String} sessionId
   * @param {Number} tile
   * @param {Number} penalty
   */
  async tilePenalty(boardId, sessionId, tile, penalty) {
    //
    const result = {};
    await this.execute(async (multi) => {
      // * Keys
      const tileOwner = await multi.hget(mapKey, tile);
      const mapKey = `${this.prefix.BOARD_PURCHASE_TILE_MAP}:${boardId}`;
      const penaltyPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
      const ownerPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${tileOwner}`;

      //
      let pennaltyPlayerGold = await multi.hget(penaltyPlayerInfoKey, 'gold');
      console.log(
        '[ redisTransaction - tilePenalty ] pennaltyPlayerGold ==>> ',
        pennaltyPlayerGold,
      );
      let ownerPlayerGold = await multi.hget(ownerPlayerInfoKey, 'gold');
      console.log('[ redisTransaction - tilePenalty ] ownerPlayerGold ==>> ', ownerPlayerGold);

      pennaltyPlayerGold = pennaltyPlayerGold - penalty;
      ownerPlayerGold = ownerPlayerGold + penalty;

      await multi.hset(penaltyPlayerInfoKey, 'gold', pennaltyPlayerGold);
      await multi.hset(ownerPlayerInfoKey, 'gold', ownerPlayerGold);

      // TODO: 페널티 이력 저장?

      // * 페널티가 적용된 플레이어 정보 반환
      result.playersInfo = [];
      const PlayersInfoKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const playerSessionIds = this.client.lrange(PlayersInfoKey, 0, -1);
      playerSessionIds.forEach(async (sId) => {
        const playerInfo = await multi.hget(`${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sId}`);
        playerInfo.sessionId = sId;
        result.playersInfo.push(playerInfo);
      });
    });

    return result;
  }

  //
}

export default redisTransaction;
