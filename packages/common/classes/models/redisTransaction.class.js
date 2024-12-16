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
   * 순차적으로 실행 시켜주는 헬퍼 메소드
   * @param {Function} callback - 실행할 콜백 함수
   * @returns {Promise<any>} 트랜잭션 결과
   */
  async execute(callback) {
    try {
      await callback(this.client);
      return true;
    } catch (error) {
      console.error('[ redisTransaction ] ===> error', error);
      return false;
    }
  }

  /**
   * 로비 입장 트랜잭션
   * @param {string} sessionId
   * @param {string} lobbyId
   */
  async joinLobby(sessionId, lobbyId) {
    return this.execute(async (client) => {
      const lobbyKey = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;

      await client.sadd(lobbyKey, sessionId);
      await client.expire(lobbyKey, this.expire);
      await client.hset(locationKey, 'lobby', lobbyId);
      await client.expire(locationKey, this.expire);
    });
  }

  /**
   * 로비 퇴장 트랜잭션
   * @param {string} sessionId
   * @param {string} lobbyId
   */
  async leaveLobby(sessionId, lobbyId, nickname) {
    return this.execute(async (client) => {
      const lobbyKey = `${this.prefix.LOBBY_USERS}:${lobbyId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;
      const userKey = `${this.prefix.USER}:${sessionId}`;
      const loginKey = `${this.prefix.LOGIN}`;

      await client.srem(lobbyKey, sessionId);
      await client.hdel(locationKey, 'lobby');
      await client.del(userKey);
      await client.srem(loginKey, nickname);
    });
  }

  /**
   * 대기방 생성 트랜잭션
   * @param {RoomData} room
   */
  async createRoom(room, sessionId) {
    return this.execute(async (client) => {
      const roomKey = `${this.prefix.ROOM}:${room.roomId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;
      const lobbyRoomListKey = `${this.prefix.LOBBY_ROOM_LIST}:${room.lobbyId}`;

      await client.exists(roomKey);
      await client.hset(roomKey, {
        roomId: room.roomId,
        ownerId: room.ownerId,
        roomName: room.roomName,
        state: room.state,
        lobbyId: room.lobbyId,
        users: room.users,
        maxUser: room.maxUser,
        readyUsers: room.readyUsers,
      });
      await client.expire(roomKey, this.expire);
      await client.sadd(lobbyRoomListKey, roomKey);
      await client.expire(lobbyRoomListKey, this.expire);
      await client.hset(locationKey, 'room', room.roomId);
      await client.expire(locationKey, this.expire);
    });
  }

  /**
   * 대기방 입장 트랜잭션
   * @param {string} roomId
   * @param {RoomData} room
   * @param {string} sessionId
   */
  async joinRoom(roomId, room, sessionId) {
    return this.execute(async (client) => {
      const roomKey = `${this.prefix.ROOM}:${roomId}`;
      const locationKey = `${this.prefix.LOCATION}:${sessionId}`;

      await client.hset(roomKey, room);
      await client.expire(roomKey, this.expire);
      await client.hset(locationKey, 'room', roomId);
      await client.expire(locationKey, this.expire);
    });
  }

  /**
   * 대기방 삭제 트랜잭션
   * @param {string} roomId
   * @param {string} lobbyId
   */
  async deleteRoom(roomId, lobbyId) {
    return this.execute(async (client) => {
      const roomKey = `${this.prefix.ROOM}:${roomId}`;
      const lobbyRoomListKey = `${this.prefix.LOBBY_ROOM_LIST}:${lobbyId}`;

      await client.del(roomKey);
      await client.srem(lobbyRoomListKey, roomKey);
    });
  }

  /**
   * 보드게임 생성 트랜잭션
   * @param {*} board
   */
  async createBoardGame(board) {
    const result = await this.execute(async (client) => {
      const boardKey = `${this.prefix.BOARD}:${board.boardId}`;
      const playersKey = `${this.prefix.BOARD_PLAYERS}:${board.boardId}`;

      await client.exists(boardKey);

      // * 룸 상태 변경 [BOARD]
      const roomKey = `${this.prefix.ROOM}:${board.roomId}`;
      await client.hset(roomKey, 'state', config.ROOM_STATE.BOARD);

      // * 보드 정보 저장
      await client.hset(boardKey, {
        boardId: board.boardId,
        roomId: board.roomId,
        ownerId: board.ownerId,
        state: board.state,
        maxTurn: board.turn,
        nowTurn: 1,
      });
      await client.expire(boardKey, this.expire);

      const users = JSON.parse(board.users);
      users.forEach(async (sessionId) => {
        console.log('[ createBoardGame : for ] sessionId ===> ', sessionId);

        // * 보드 플레이어 목록 저장
        await client.sadd(playersKey, sessionId);
        await client.expire(playersKey, this.expire);

        // * 보드 플레이어 정보 저장
        // 골드, 트로피, 플레이어 타일 위치,
        const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${board.boardId}:${sessionId}`;
        await client.hset(boardPlayerInfoKey, {
          gold: 10, // TODO: 게임 데이터에서 파싱?
          trophy: 0,
          tileLocation: 0, // TODO: 시작 위치?
        });
        await client.expire(boardPlayerInfoKey, this.expire);

        const locationKey = `${this.prefix.LOCATION}:${sessionId}`;
        // * 유저 위치정보 - 보드 저장
        await client.hset(locationKey, 'board', board.boardId);
        await client.expire(locationKey, this.expire);
      });
    });

    return result;
  }

  /**
   * 유저 세션 생성 트랜잭션
   * @param {string} sessionId
   * @param {string} loginId
   * @param {UserData} user
   */
  async createUser(sessionId, loginId, user) {
    return this.execute(async (client) => {
      const userKey = `${this.prefix.USER}:${sessionId}`;
      const loginKey = `${this.prefix.LOGIN}`;

      await client.hset(userKey, {
        nickname: user.nickname,
      });
      await client.expire(userKey, this.expire);
      await client.sadd(loginKey, user.nickname);
      await client.expire(loginKey, this.expire);
    });
  }

  /**
   * 유저 세션 삭제 트랜잭션
   * @param {string} sessionId
   * @param {string} loginId
   */
  async deleteUser(sessionId, loginId) {
    return this.execute(async (client) => {
      const userKey = `${this.prefix.USER}:${sessionId}`;
      const loginKey = `${this.prefix.LOGIN}`;

      await client.del(loginKey, loginId);
      await client.del(userKey);
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

    await this.execute(async (client) => {
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
          purchaseGold = -1;
        } else {
          // * 타일주인이 없음 : 10G
          await client.hset(
            mapKey,
            tile,
            JSON.stringify({
              sessionId,
              gold: purchaseGold,
            }),
          );
          await client.expire(mapKey, this.expire);
        }
      } else {
        // * 타일주인이 있음 : 구매가 * 1.5
        const purchasingPrice = JSON.parse(tileOwner).gold;
        purchaseGold = Math.floor(purchasingPrice * 1.5);

        // * 골드가 부족하면 리턴 -1
        if (Number(playerInfo.gold) < purchaseGold) {
          logger.info(`골드가 부족함2 : ${playerInfo.gold}, ${purchaseGold}`);
          purchaseGold = -1;
        } else {
          await client.hset(
            mapKey,
            tile,
            JSON.stringify({
              sessionId,
              gold: purchaseGold,
            }),
          );
          await client.expire(mapKey, this.expire);
        }
      }
      await client.sadd(historyKey, tile);
      await client.expire(historyKey, this.expire);

      const nowGold = Number(playerInfo.gold) - purchaseGold;
      const boardPlayerInfoKey = `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sessionId}`;
      await client.hset(boardPlayerInfoKey, 'gold', nowGold);
      await client.expire(boardPlayerInfoKey, this.expire);

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
    await this.execute(async (client) => {
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

        await client.hset(penaltyPlayerInfoKey, 'gold', pennaltyPlayerGold);
        await client.expire(penaltyPlayerInfoKey, this.expire);
        await client.hset(ownerPlayerInfoKey, 'gold', ownerPlayerGold);
        await client.expire(ownerPlayerInfoKey, this.expire);
      }

      // TODO: 페널티 이력 저장?
    });

    // * 모든 플레이어 정보 반환
    result.playersInfo = [];
    const boardPlayersKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
    const playerSessionIds = await this.client.smembers(boardPlayersKey);

    console.log('[ playerSessionIds ] boardPlayersKey ===>>> ', boardPlayersKey);
    console.log('[ playerSessionIds ] playerSessionIds ===>>> ', playerSessionIds);

    for (let i = 0; i < playerSessionIds.length; i++) {
      const sId = playerSessionIds[i];

      const playerInfo = await this.client.hgetall(
        `${this.prefix.BOARD_PLAYER_INFO}:${boardId}:${sId}`,
      );

      playerInfo.sessionId = sId;
      console.log('[ playerSessionIds ] playerInfo ===>>> ', playerInfo);
      result.playersInfo.push(playerInfo);
      console.log('[ playerSessionIds ] result.playersInfo ===>>> ', result.playersInfo);
    }

    return result;
  }

  /**
   * sessionId 값으로 소속 보드게임의 플레이어 정보를 모두 조회함
   * @param {String} sessionId
   */
  async getBoardPlayersInfo(sessionId) {
    //
    const result = {};
    await this.execute(async (client) => {
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
    await this.execute(async (client) => {
      // BOARD_DART_HISTORY
      const dartHistKey = `${this.prefix.BOARD_DART_HISTORY}:${boardId}`;
      const histCount = await this.client.zrange(dartHistKey, 0, -1).length;

      // BOARD_PLAYERS
      const boardPlayerKey = `${this.prefix.BOARD_PLAYERS}:${boardId}`;
      const boardPlayerCount = await this.client.scard(boardPlayerKey);

      logger.info('[ BOARD: boardDartCount ] histCount ===>>> ', histCount);
      logger.info('[ BOARD: boardDartCount ] boardPlayerCount ===>>> ', boardPlayerCount);

      // TODO:
      if (histCount < boardPlayerCount) {
        await client.zadd(dartHistKey, {
          score: dartData.distance,
          value: sessionId,
        });
        await client.expire(dartHistKey, this.expire);

        const dartInfoKey = `${this.prefix.BOARD_DART_HISTORY}:${boardId}:${sessionId}`;
        const dartInfoData = {
          distance: dartData.distance,
          angle: JSON.stringify(dartData.angle),
          location: JSON.stringify(dartData.location),
          power: dartData.power,
        };
        await client.hset(dartInfoKey, dartInfoData);
        await client.expire(dartInfoKey, this.expire);
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

    await this.execute(async (client) => {
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

          const gold = Number(boardPlayerInfo.gold) + tileCount * 50;

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
        await client.hset(boardKey, 'nowTurn', Number(nowTurn) + 1);
        await client.expire(boardKey, this.expire);
        logger.info(' result rank ELSSS ===>> ', result.rank);
      }
    });

    return result;
  }
} //

export default redisTransaction;
