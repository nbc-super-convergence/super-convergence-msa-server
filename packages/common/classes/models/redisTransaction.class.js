import { config } from '../../config/config.js';
import { logger } from '../../config/index.js';

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
    // 기본금액 10G
    let purchaseGold = 10;

    await this.execute(async (multi) => {
      /**
       * 1. 타일 주인 매핑 정보 저장 hash
       * 2. 구매 이력 정보 저장 list
       */
      const mapKey = `${this.prefix.BOARD_PURCHASE_TILE_MAP}:${boardId}`;
      const historyKey = `${this.prefix.BOARD_PURCHASE_TILE_HISTORY}:${boardId}:${sessionId}`;

      const playerInfo = await this.redisUtil.getBoardPlayerinfo(boardId, sessionId);
      logger.info('[ REDIS - TRANSACTION ] playerInfo ==>> ', playerInfo);

      // * 타일 주인 있는지 확인
      const tileOwner = await this.client.hget(mapKey, tile);
      if (!tileOwner) {
        // * 골드가 부족하면 리턴 -1
        if (Number(playerInfo.gold) < purchaseGold) {
          logger.info(`골드가 부족함 : ${playerInfo.gold}, ${purchaseGold}`);
          return -1;
        }

        // * 타일주인이 없음 : 10G
        await multi.hset(
          mapKey,
          tile,
          JSON.stringify({
            sessionId,
            gold: purchaseGold,
          }),
        );
      } else {
        // * 타일주인이 있음 : 구매가 * 1.5
        const purchasingPrice = JSON.parse(tileOwner).gold;
        purchaseGold = Math.floor(purchasingPrice * 1.5);

        // * 골드가 부족하면 리턴 -1
        if (Number(playerInfo.gold) < purchaseGold) {
          logger.info(`골드가 부족함2 : ${playerInfo.gold}, ${purchaseGold}`);
          return -1;
        }

        await multi.hset(
          mapKey,
          tile,
          JSON.stringify({
            sessionId,
            gold: purchaseGold,
          }),
        );
      }
      await multi.sadd(historyKey, tile);

      const nowGold = Number(playerInfo.gold) - purchaseGold;
      const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
      await multi.hset(boardPlayerInfoKey, 'gold', nowGold);

      logger.info('[ REDIS - TRANSACTION ] nowGold ==>> ', nowGold);
    });

    return purchaseGold;
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
      const tileOwnerStr = await this.client.hget(mapKey, tile);
      const tileOwner = JSON.parse(tileOwnerStr);
      const penaltyPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
      const ownerPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${tileOwner.sessionId}`;

      // TODO: 벌금, 구매가를 가져오는 방식으로 수정해야함
      // TODO: 테스트 예정 : 24.12.10
      let penalty = Math.floor(tileOwner.gold / 2); // 10 / 2;

      //
      let pennaltyPlayerGold = await this.client.hget(penaltyPlayerInfoKey, 'gold');
      console.log(
        '[ redisTransaction - tilePenalty ] pennaltyPlayerGold ==>> ',
        pennaltyPlayerGold,
      );
      let ownerPlayerGold = await this.client.hget(ownerPlayerInfoKey, 'gold');
      console.log('[ redisTransaction - tilePenalty ] ownerPlayerGold ==>> ', ownerPlayerGold);

      // * 소지 골드는 0이하로 떨어지지 않는다
      if (pennaltyPlayerGold > 0) {
        if (penalty > pennaltyPlayerGold) {
          penalty = pennaltyPlayerGold;
        }

        pennaltyPlayerGold = Number(pennaltyPlayerGold) - penalty;
        ownerPlayerGold = Number(ownerPlayerGold) + penalty;

        console.log('[ redisTransaction - tilePenalty ] penalty ==>> ', penalty);
        console.log(
          '[ redisTransaction - tilePenalty ] pennaltyPlayerGold ==>> ',
          pennaltyPlayerGold,
        );
        console.log('[ redisTransaction - tilePenalty ] ownerPlayerGold ==>> ', ownerPlayerGold);

        await multi.hset(penaltyPlayerInfoKey, 'gold', pennaltyPlayerGold);
        await multi.hset(ownerPlayerInfoKey, 'gold', ownerPlayerGold);
      }

      // TODO: 페널티 이력 저장?
    });

    // * 모든 플레이어 정보 반환
    result.playersInfo = [];
    const boardPlayersKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
    const playerSessionIds = await this.client.smembers(boardPlayersKey);
    playerSessionIds.forEach(async (sId) => {
      const playerInfo = await this.client.hgetall(
        `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sId}`,
      );
      playerInfo.sessionId = sId;
      result.playersInfo.push(playerInfo);
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
      const boardId = await this.client.hget(boardKey, 'board');

      // * sessionIds 돌면서 정보 삽입
      const boardPlayersKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const playerSessionIds = await this.client.lrange(boardPlayersKey, 0, -1);
      playerSessionIds.forEach(async (sId) => {
        const playerInfo = await this.client.hget(
          `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sId}`,
        );
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
      const histCount = await this.client.zrange(dartHistKey, 0, -1).length;

      // BOARD_PLAYERS
      const boardPlayerKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const boardPlayerCount = await this.client.scard(boardPlayerKey);
      // TODO:
      if (histCount < boardPlayerCount) {
        await multi.zadd(dartHistKey, {
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
        const boardPlayers = await this.client.smembers(boardPlayerKey);
        console.log('[ boardPlayers ] ====>> ', boardPlayers);

        result.isOk = true;
        for (let i = 0; i < boardPlayers.length; i++) {
          //
          const dartInfoKey = `${this.prefix.BOARD_DART_HISTORY}:${boardId}:${boardPlayers[i]}`;
          const dartInfoData = await this.client.hgetall(dartInfoKey);

          result.diceGameDatas.push({
            sessionId: boardPlayers[i],
            value: 0,
            rank: await this.client.zrem(dartHistKey, boardPlayers[i]),
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

      logger.info('  [ BOARD: turnEnd  ] boardKey => ', boardKey);
      const boardObj = await this.client.hgetall(boardKey);
      const maxTurn = Number(boardObj.maxTurn);
      const nowTurn = Number(boardObj.nowTurn);

      logger.info('  [ BOARD: turnEnd  ] boardObj => ', boardObj);
      logger.info('  [ BOARD: turnEnd  ] maxTurn => ', maxTurn);
      logger.info('  [ BOARD: turnEnd  ] nowTurn => ', nowTurn);

      if (nowTurn >= maxTurn) {
        result.isGameOver = true;
        // TODO: 영수증 ㄱㄱ
        const boardPlayersKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
        const boardPlayers = await this.client.smembers(boardPlayersKey);

        logger.info('  [ BOARD: turnEnd  ] boardPlayers => ', boardPlayers);

        for (let i = 0; i < boardPlayers.length; i++) {
          const playerSessionId = boardPlayers[i];
          logger.info(' playerSessionId => ', playerSessionId);

          const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${playerSessionId}`;
          logger.info(' boardPlayerInfoKey => ', boardPlayerInfoKey);

          const boardPlayerInfo = await this.client.hgetall(boardPlayerInfoKey);
          logger.info(' boardPlayerInfo => ', boardPlayerInfo);

          const tileHistoryKey = `${this.prefix.BOARD_PURCHASE_TILE_HISTORY}:${boardId}:${playerSessionId}`;
          logger.info(' tileHistoryKey => ', tileHistoryKey);
          const tileCount = await this.client.scard(tileHistoryKey);
          logger.info(' tileCount => ', tileCount);

          const gold = boardPlayerInfo.gold + tileCount * 50;

          result.rank.push({
            sessionId: playerSessionId,
            rank: 0,
            tileCount,
            gold,
          });
        }

        logger.info(' result rank1111 ===>> ', result.rank);

        // 정렬
        result.rank = result.rank.sort((a, b) => {
          return a.gold - b.gold;
        });

        logger.info(' result rank2222 ===>> ', result.rank);
        // 순위 저장
        result.rank.forEach((e, i) => (e.rank = i + 1));
        logger.info(' result rank3333 ===>> ', result.rank);
      } else {
        // * 턴 + 1
        logger.info('[ turnEnd ] nowTurn type ===>> ', typeof nowTurn);
        await multi.hset(boardKey, 'nowTurn', Number(nowTurn) + 1);
        logger.info(' result rank ELSSS ===>> ', result.rank);
      }
    });

    return result;
  }
} //

export default redisTransaction;
