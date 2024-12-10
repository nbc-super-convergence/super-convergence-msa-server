import { config } from '../../config/config.js';

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
  async leaveLobby(sessionId, lobbyId, nickname) {
    return this.execute(async (multi) => {
      const lobbyKey = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;
      const userKey = `${this.prefix.USER}:${sessionId}`;
      const loginKey = `${this.prefix.LOGIN}`;

      multi.srem(lobbyKey, sessionId);
      multi.hdel(locationKey, 'lobby');
      multi.del(userKey);
      multi.srem(loginKey, nickname);
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

      multi.exists(boardKey);

      // * 룸 상태 변경 [BOARD]
      const roomKey = `${this.prefix.ROOM}:${board.roomId}`;
      multi.hset(roomKey, 'state', config.ROOM_STATE.BOARD);

      // * 보드 정보 저장
      multi.hset(boardKey, {
        boardId: board.boardId,
        roomId: board.roomId,
        ownerId: board.ownerId,
        state: board.state,
        maxTurn: board.turn,
        nowTurn: 1,
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

        const locationKey = `${this.prefix.LOCATION}:${sessionId}`;
        // * 유저 위치정보 - 보드 저장
        multi.hset(locationKey, 'board', board.boardId);
        multi.expire(locationKey, this.expire);
      });
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

      // * 타일 주인 있는지 확인
      const tileOwner = await multi.hget(mapKey, tile);
      if (!tileOwner) {
        // * 타일주인이 없음 : 10G
        await multi.hset(
          mapKey,
          tile,
          JSON.stringify({
            sessionId,
            gold: 10,
          }),
        );
      } else {
        // * 타일주인이 있음 : 구매가 * 1.5
        const purchasingPrice = JSON.parse(tileOwner).gold;
        await multi.hset(
          mapKey,
          tile,
          JSON.stringify({
            sessionId,
            gold: Math.floor(purchasingPrice * 1.5),
          }),
        );
      }
      await multi.sadd(historyKey, tile);
    });
  }

  /**
   * 보드 - 타일 페널티에 의한 결과를 반영한 플레이어들 정보 반환
   * @param {String} boardId
   * @param {String} sessionId
   * @param {Number} tile
   */
  async tilePenalty(boardId, sessionId, tile) {
    /*
     * 기본 구매가 : 10 골드 [v]
     * 벌금 : 구매가 1/2
     * 매수 : 구매가 * 1.5
     * 골드의 소수점은 모두 내림 처리
     *
     * 벌금 적용 : 0까지만, 대신 타일 주인도 깎인 만큼만 증가 시켜줄 것 [v]
     */
    const result = {};
    await this.execute(async (multi) => {
      // * Keys
      const mapKey = `${this.prefix.BOARD_PURCHASE_TILE_MAP}:${boardId}`;
      const tileOwnerStr = await multi.hget(mapKey, tile);
      const tileOwner = JSON.parse(tileOwnerStr);
      const penaltyPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
      const ownerPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${tileOwner.sessionId}`;

      // TODO: 벌금, 구매가를 가져오는 방식으로 수정해야함
      // TODO: 테스트 예정 : 24.12.10
      let penalty = Math.floor(tileOwner.gold / 2); // 10 / 2;

      //
      let pennaltyPlayerGold = await multi.hget(penaltyPlayerInfoKey, 'gold');
      console.log(
        '[ redisTransaction - tilePenalty ] pennaltyPlayerGold ==>> ',
        pennaltyPlayerGold,
      );
      let ownerPlayerGold = await multi.hget(ownerPlayerInfoKey, 'gold');
      console.log('[ redisTransaction - tilePenalty ] ownerPlayerGold ==>> ', ownerPlayerGold);

      // * 소지 골드는 0이하로 떨어지지 않는다
      if (pennaltyPlayerGold > 0) {
        if (penalty > pennaltyPlayerGold) {
          penalty = pennaltyPlayerGold;
        }

        pennaltyPlayerGold = pennaltyPlayerGold - penalty;
        ownerPlayerGold = ownerPlayerGold + penalty;

        await multi.hset(penaltyPlayerInfoKey, 'gold', pennaltyPlayerGold);
        await multi.hset(ownerPlayerInfoKey, 'gold', ownerPlayerGold);
      }

      // TODO: 페널티 이력 저장?

      // * 모든 플레이어 정보 반환
      result.playersInfo = [];
      const PlayersInfoKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const playerSessionIds = await multi.lrange(PlayersInfoKey, 0, -1);
      playerSessionIds.forEach(async (sId) => {
        const playerInfo = await multi.hget(`${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sId}`);
        playerInfo.sessionId = sId;
        result.playersInfo.push(playerInfo);
      });
    });

    return result;
  }

  /**
   * sessionId 값으로 소속 보드게임의 플레이어 정보를 모두 조회함
   * @param {String} sessionId
   */
  async getBoardPlayersInfo(sessionId) {
    //
    const result = {};
    await this.execute(async (multi) => {
      result.playersInfo = [];

      // * boardId 조회
      const boardKey = `${this.prefix.LOCATION}:${sessionId}`;
      const boardId = await multi.hget(boardKey, 'board');

      // * sessionIds 돌면서 정보 삽입
      const boardPlayersKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const playerSessionIds = await multi.lrange(boardPlayersKey, 0, -1);
      playerSessionIds.forEach(async (sId) => {
        const playerInfo = await multi.hget(`${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sId}`);
        playerInfo.sessionId = sId;
        result.playersInfo.push(playerInfo);
      });
    });
    return result;
  }

  /**
   * 미니 순서게임 (다트)
   * @param {String} boardId
   * @param {String} sessionId
   * @param {Object} dartData
   * @returns
   */
  async boardDartCount(boardId, sessionId, dartData) {
    const result = {};
    result.isOk = false;
    result.diceGameDatas = [];
    await this.execute(async (multi) => {
      // BOARD_DART_HISTORY
      const dartHistKey = `${this.prefix.BOARD_DART_HISTORY}:${boardId}`;
      const histCount = await multi.zRange(dartHistKey, 0, -1).length;

      // BOARD_PLAYERS
      const boardPlayerKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const boardPlayerCount = await multi.scard(boardPlayerKey);
      // TODO:
      if (histCount < boardPlayerCount) {
        await multi.zAdd(dartHistKey, {
          score: dartData.distance,
          value: sessionId,
        });

        const dartInfoKey = `${this.prefix.BOARD_DART_HISTORY}:${boardId}:${sessionId}`;
        const dartInfoData = {
          distance: dartData.distance,
          angle: JSON.stringify(dartData.angle),
          location: JSON.stringify(dartData.location),
          power: dartData.power,
        };
        await multi.hset(dartInfoKey, dartInfoData);
      } else {
        const boardPlayers = await multi.smembers(boardPlayerKey);
        console.log('[ boardPlayers ] ====>> ', boardPlayers);

        result.isOk = true;
        for (let i = 0; i < boardPlayers.length; i++) {
          //
          const dartInfoKey = `${this.prefix.BOARD_DART_HISTORY}:${boardId}:${boardPlayers[i]}`;
          const dartInfoData = await multi.hgetall(dartInfoKey);

          result.diceGameDatas.push({
            sessionId: boardPlayers[i],
            value: 0,
            rank: await multi.zRem(dartHistKey, boardPlayers[i]),
            distance: dartInfoData.distance,
            angle: JSON.parse(dartInfoData.angle),
            location: JSON.parse(dartInfoData.location),
            power: dartInfoData.power,
          });
        }
      }
    });
    return result;
  }

  /**
   * * 턴 종료 & 보드게임 종료
   * @param {String} sessionId
   * @param {String} boardId
   * @returns
   */
  async turnEnd(sessionId, boardId) {
    //
    const result = {};
    result.isGameOver = false;
    result.rank = [];
    await this.execute(async (multi) => {
      // TODO: manager에 있는거 옮기고, 영수증 처리 ㄱㄱ

      const boardKey = `${this.prefix.BOARD}:${boardId}`;

      const maxTurn = await multi.hget(boardKey, `maxTurn`);
      const nowTurn = await multi.hget(boardKey, `nowTurn`);

      if (maxTurn >= nowTurn) {
        result.isGameOver = true;
        // TODO: 영수증 ㄱㄱ
        const boardPlayers = await multi.smembers(boardKey);

        for (let i = 0; i < boardPlayers.length; i++) {
          const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${boardPlayers[i]}`;
          const boardPlayerInfo = await multi.hgetall(boardPlayerInfoKey);

          const tileHistoryKey = `${this.prefix.BOARD_PURCHASE_TILE_HISTORY}:${boardId}:${sessionId}`;
          const tileCount = await multi.scard(tileHistoryKey);

          const gold = boardPlayerInfo.gold + tileCount * 50;

          result.rank.push({
            sessionId: boardPlayers[i],
            rank: 0,
            tileCount,
            gold,
          });
        }

        // 정렬
        result.rank = result.rank.sort((a, b) => {
          return a.gold - b.gold;
        });

        // 순위 저장
        result.rank.forEach((e, i) => (e.rank = i + 1));
      } else {
        // * 턴 + 1
        await multi.hset(boardKey, 'nowTurn', nowTurn + 1);
      }
    });
    return result;
  }
} //

export default redisTransaction;
