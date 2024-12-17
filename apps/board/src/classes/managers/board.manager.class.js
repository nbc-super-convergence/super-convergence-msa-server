import { FAIL_CODE } from '@repo/common/failcodes';
import { pubRedisClient, redis } from '../../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { BOARD_STATE } from '../../constants/state.js';
import { getRollDiceResult } from '../../utils/dice.utils.js';
import { logger } from '../../utils/logger.utils.js';
import { SELECT_MINI_GAME } from '../../constants/env.js';
import { MESSAGE_TYPE } from '@repo/common/header';
import { serializeForGate } from '@repo/common/utils';

class BoardManager {
  constructor() {
    if (BoardManager.instance) {
      return BoardManager.instance;
    }
    BoardManager.instance = this;
  }

  static getInstance() {
    if (!BoardManager.instance) {
      BoardManager.instance = new BoardManager();
    }
    return BoardManager.instance;
  }

  /**
   * 새 보드게임 생성
   * @param {String} sessionId - 방장 세션 ID
   * @param {Number} turn - 방장 세션 ID
   */
  async createBoard(sessionId, turn) {
    try {
      // * redis에서 유저 정보 조회 [ getUserToSession ]
      const userData = await redis.getUserToSession(sessionId);
      logger.info('[ BOARD: gameStartRequestHandler ] userData ===>>> ', userData);

      // * redis에서 유저 roomId 조회
      const userLocation = await redis.getUserLocation(sessionId);
      logger.info('[ BOARD: gameStartRequestHandler ] userLocation ===>>> ', userLocation);

      // * room 정보 조회
      const roomData = await redis.getRoom(userLocation.room);
      logger.info('[ BOARD: gameStartRequestHandler ] roomData ===>>> ', roomData);

      // * 방의 상태가 준비(1)가 아니면 거절
      if (Number(roomData.state) !== 1) {
        logger.info('[ BOARD: gameStartRequestHandler ] roomData.state ===>>> ', roomData.state);
        logger.error(
          '[ BOARD: gameStartRequestHandler ] 방 상태가 준비가 아닌데, 시작 요청이 들어옴  ===>>> ',
          roomData,
        );
        return { success: false, data: null, failCode: FAIL_CODE.INVALID_ROOM_STATE };
      }

      // * 방장만 시작 요청 가능
      if (roomData.ownerId === sessionId) {
        // const playerNumber = Math.floor(Math.random() * 4);
        const board = {
          boardId: uuidv4(),
          roomId: userLocation.room,
          ownerId: sessionId,
          turn: 40, // TODO: 추후 변경, turnEnd에서 매번1씩 오름
          users: roomData.users,
          state: BOARD_STATE.WAITING,
        };

        logger.info(' [ BOARD: createBoard ] IF  board ===>>> ', board);

        // * redisUtil에서 redisTransaction으로 변경
        const result = await redis.transaction.createBoardGame(board);

        // * 트랜잭션 성공했을 때만 publish
        if (result) {
          const channel = redis.channel.BOARD;
          const message = board.boardId + ':' + board.users;
          await pubRedisClient.publish(channel, message);
          console.log(`[${channel}] Channel Notification Sent: [${message}]`);
        }

        const users = JSON.parse(roomData.users);
        const data = {};
        data.users = [];
        data.players = [];

        for (let i = 0; i < users.length; i++) {
          const sId = users[i];
          const user = await redis.getUserToSession(sId);
          const playeData = {
            sessionId: sId,
            nickname: user.nickname,
            position: 1, // TODO: 0? 1?
          };
          data.players.push(playeData);
          data.users.push(sId);
        }

        logger.info('[ data ]  ===>> ', data);

        return { success: true, data: data, failCode: 0 };
      } else {
        logger.error('방장만 게임시작 요청을 할 수 있습니다. : sessionId ==>> ', sessionId);
        return { success: false, data: null, failCode: FAIL_CODE.NOT_THE_OWNER };
      }
    } catch (e) {
      logger.error('[ BOARD : createBoard ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 주사위를 던진다
   * @param {*} sessionId
   */
  async rollDice(sessionId) {
    //
    try {
      const DICE_MAX_VALUE = 6;
      const DICE_COUNT = 1;

      const diceResult = getRollDiceResult(DICE_MAX_VALUE, DICE_COUNT);

      const sessionIds = await redis.getBoardPlayersBySessionId(sessionId);

      // TODO: [업적용] 플레이어 주사위 이력

      return {
        success: true,
        data: {
          diceResult,
          sessionIds,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ BOARD : rollDice ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 플레이어 이동
   * @param {*} sessionId - 플레이어 세션 아이디
   * @param {*} targetPoint - 이동할 위치
   */
  async movePlayerInBoard(sessionId, targetPoint) {
    try {
      const sessionIds = await redis.getBoardPlayersBySessionId(sessionId);

      // TODO: [업적용] 플레이어 이동 이력

      return {
        success: true,
        data: {
          targetPoint,
          sessionIds,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ BOARD : movePlayerInBoard ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 타일 구매 이벤트
   * @param {String} sessionId
   * @param {Number} tile
   */
  async purchaseTileInBoard(sessionId, tile) {
    //
    try {
      let isPurchased = true;
      const boardId = await redis.getUserLocationField(sessionId, 'board');
      const sessionIds = await redis.getBoardPlayers(boardId);

      logger.info('[ BOARD: purchaseTileInBoard ] sessionIds ===>> ', sessionIds);

      // TODO: 1 - 타일 주인 정보 저장,
      // TODO: 2 - [업적용] 타일 구매이력 저장
      const purchaseGold = await redis.transaction.createPurchaseTileInfo(boardId, sessionId, tile);

      logger.info('[ BOARD: ] purchaseGold ===>> ', purchaseGold);

      const playersInfo = [];
      const playerInfo = await redis.getBoardPlayerinfo(boardId, sessionId);
      playerInfo.sessionId = sessionId;

      // * -1이면 소유골드가 부족한 것
      if (purchaseGold < 0) {
        logger.error(
          `[ BOARD: GOLD : purchaseGold: ${purchaseGold} ,, Gold: ${playerInfo.gold}]  `,
        );
        isPurchased = false;
      }

      const others = sessionIds.filter((sId) => sId !== sessionId);
      logger.info('[ BOARD: purchaseTileInBoard ] others ===>> ', others);
      for (let i = 0; i < others.length; i++) {
        const info = await redis.getBoardPlayerinfo(boardId, others[i]);
        info.sessionId = others[i];
        playersInfo.push(info);
      }

      logger.info('[ BOARD: purchaseTileInBoard ] playerInfo ===>> ', playerInfo);
      logger.info('[ BOARD: purchaseTileInBoard ] playersInfo ===>> ', playersInfo);

      return {
        success: true,
        isPurchased,
        data: {
          tile,
          sessionIds,
          playersInfo, // all
          playerInfo, // self
          purchaseGold,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ BOARD : purchaseTileInBoard ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 레디스 룸데이터를 proto 형식에 맞춰어 변경
   * @param {Object} roomData redis-roomData
   * @returns
   */
  async roomDataToResponse(roomData) {
    try {
      if (!roomData) return null;

      // users가 문자열인 경우 파싱
      let userIds = [];
      if (typeof roomData.users === 'string') {
        userIds = JSON.parse(roomData.users);
      } else if (roomData.users instanceof Set) {
        userIds = Array.from(roomData.users);
      } else if (Array.isArray(roomData.users)) {
        userIds = roomData.users.map((user) => user.sessionId);
      }

      //* 클러스터 환경에서는 Promise.all로 병렬 처리
      const userDataPromises = userIds.map(async (sessionId) => {
        try {
          const userData = await redis.client.hgetall(`${redis.prefix.USER}:${sessionId}`);
          return userData
            ? {
                sessionId,
                nickname: userData.nickname,
              }
            : null;
        } catch (error) {
          logger.error(`[ toResponse ] ====> Error redis ${sessionId}:`, error);
          return null;
        }
      });

      const users = (await Promise.all(userDataPromises)).filter((user) => user !== null);

      const readyUsers = JSON.parse(roomData.readyUsers);
      logger.info('[ BOARD: roomData ] users.length ===>> ', users.length);
      logger.info('[ BOARD: roomData ] readyUsers.length ===>> ', readyUsers.length);

      let roomState = Number(roomData.state);
      if (users.length - 1 === readyUsers.length) {
        // PREPARE : 1
        roomState = Number(1);
      }

      return {
        roomId: roomData.roomId,
        ownerId: roomData.ownerId,
        roomName: roomData.roomName,
        lobbyId: roomData.lobbyId,
        state: roomState,
        users,
        maxUser: Number(roomData.maxUser),
        readyUsers, //'[]'
      };
    } catch (error) {
      logger.error('[ BOARD: toResponse ] ====> unknown error', error);
    }
  }

  /**
   * 대기실로 되돌아 가기
   * @param {String} sessionId
   */
  async backTotheRoom(sessionId) {
    //
    try {
      const sessionIds = await redis.getBoardPlayersBySessionId(sessionId);
      const roomId = await redis.getUserLocationField(sessionId, 'room');
      const room = await redis.getRoom(roomId);

      logger.info(' [ BOARD: backTotheRoom ] room ===>> ', room);

      const roomDto = await this.roomDataToResponse(room);
      return {
        success: true,
        data: {
          room: roomDto,
          sessionIds,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ BOARD : backTotheRoom ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 트로피 구매
   * TODO: [ 불필요 ] 삭제 예정 24.12.10
   * @param {String} sessionId
   * @param {Number} tile
   */
  async purchaseTrophy(sessionId, tile) {
    //
    let nextTile = tile;
    let isSuccess = true;
    let faileCode = FAIL_CODE.NONE_FAILCODE;

    try {
      const trophyValue = 2; // TODO: 임시 트로피 값
      // * 해당 플레이어 정보 수정
      const boardId = await redis.getUserLocationField(sessionId, 'board');
      const boardPlayerInfo = await redis.getBoardPlayerinfo(boardId, sessionIds);
      logger.info('[ BOARD: purchaseTrophy ] boardPlayerInfo ===>> ', boardPlayerInfo);

      let playersInfo = [];

      // * 보유 골드가 트로피 금액보다 높은지?
      if (boardPlayerInfo.gold >= trophyValue) {
        boardPlayerInfo.gold = boardPlayerInfo.gold - trophyValue;
        boardPlayerInfo.trophy++;

        logger.info('[ BOARD: purchaseTrophy ] changed boardPlayerInfo ===>> ', boardPlayerInfo);
        await redis.updateBoardPlayerInfo(boardId, sessionId, boardPlayerInfo);

        // TODO: 새로운 트로피 타일 생성, 보드 플레이어 정보 수정이랑 트랜잭션 묶어서 처리?
        nextTile = tile; // TODO: 새로운 타일로 변경 예정
        playersInfo = await redis.transaction.getBoardPlayersInfo(sessionId);
      } else {
        isSuccess = false;
        faileCode = FAIL_CODE.INVALID_REQUEST; // TODO: 추후 수정 필요
      }

      // * 전달할 플레이어 목록
      const sessionIds = await redis.getBoardPlayersBySessionId(sessionId);
      return {
        success: isSuccess,
        data: {
          sessionIds,
          boardPlayerInfo,
          playersInfo,
          nextTile,
        },
        failCode: faileCode,
      };
    } catch (e) {
      logger.error('[ BOARD : purchaseTrophy ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 타일 벌금 부여
   * @param {String} sessionId
   * @param {Number} tile
   * @returns
   */
  async tilePenalty(sessionId, tile) {
    try {
      const boardId = await redis.getUserLocationField(sessionId, 'board');
      const sessionIds = await redis.getBoardPlayers(boardId);

      const result = await redis.transaction.tilePenalty(boardId, sessionId, tile);

      logger.info('[ BOARD: tilePenalty ] result ===>>> ', result);

      return {
        success: true,
        data: {
          sessionIds,
          tile,
          playersInfo: result.playersInfo, // * 변화가 반영된 플레이어 정보
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ BOARD : tilePenalty ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 보드 - 첫 주사위 순서를 정하는 게임
   * @param {String} sessionId
   * @param {String} dartData
   * @returns
   */
  async firstDiceGame(sessionId, dartData) {
    try {
      const boardId = await redis.getUserLocationField(sessionId, 'board');
      const sessionIds = await redis.getBoardPlayers(boardId);

      // 요청 카운트
      const result = await redis.transaction.boardDartCount(boardId, sessionId, dartData);

      return {
        success: true,
        data: {
          sessionIds,
          isOk: result.isOk,
          result: result.diceGameDatas,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      logger.error('[ BOARD : firstDiceGame ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 미니게임 시작 요청, 미니게임 정해서 해당 미니게임 채널에 publish
   * channels [ iceGameChannel, danceGameChannel, dropperGameChannel, bombGameChannel ]
   * Message    : {boardId}
   * @param {String} sessionId 방장 sessionId
   */
  async startMiniGameRequest(sessionId) {
    try {
      const boardId = await redis.getUserLocationField(sessionId, 'board');
      const message = boardId;

      let channels = [];
      channels.push(redis.channel.ICE);
      channels.push(redis.channel.DANCE);
      channels.push(redis.channel.BOMB);
      channels.push(redis.channel.DROPPER);

      // * 이전 미니게임 선택지와 같으면 다시 선택
      let beforeVal = await redis.getBoardGameField(boardId, 'miniGameVal');
      beforeVal = beforeVal ? Number(beforeVal) : -1;

      let whileCnt = 0;

      // * random
      let randomVal = beforeVal;
      while (randomVal === beforeVal) {
        randomVal = Math.floor(Math.random() * channels.length);
        logger.info(
          '[ BOARD: startMiniGameRequest ] randomVal, beforeVal, channels.length, whileCnt ==>> ',
          randomVal,
          beforeVal,
          channels.length,
          whileCnt,
        );
        // * 무한루프 방지
        if (whileCnt > 10) {
          break;
        }
        whileCnt++;
      }

      // TODO: [ TEST ] env 값에 따라 선택되게끔 수정 : 24.12.11(수)
      if (SELECT_MINI_GAME !== 'ALL') {
        channels = [redis.channel[SELECT_MINI_GAME]];
        randomVal = 0;
      }

      // TODO: [ TEST ] redis 값에 따라 선택되게끔 수정 : 24.12.11(수)
      const redisMiniGameChannel = await redis.getMiniGameChannel();
      if (redisMiniGameChannel) {
        channels = [redis.channel[redisMiniGameChannel]];
        randomVal = 0;
      }

      logger.info('[ BOARD: SELECT_MINI_GAME ] redisMiniGameChannel ===>> ', redisMiniGameChannel);
      logger.info('[ BOARD: SELECT_MINI_GAME ] SELECT_MINI_GAME ===>> ', SELECT_MINI_GAME);
      logger.info('[ BOARD: SELECT_MINI_GAME ] channels ===>> ', channels);

      const channel = channels[randomVal];

      // * 미니게임 Idx 저장
      await redis.updateBoardGameField(boardId, 'miniGameVal', randomVal);

      await pubRedisClient.publish(channel, message, (err, reply) => {
        if (err) {
          logger.error('[ BOARD: startMiniGameRequest ] startMiniGameRequest ==>> ', err);
        } else {
          logger.info(
            `[ BOARD: startMiniGameRequest ]  Message sent to channel1, ${reply} subscribers received the message`,
          );
        }
      });

      logger.info(
        `[ BOARD : startMiniGameRequest ] : [${channel}] Channel Notification Sent: [${message}]`,
      );
    } catch (e) {
      logger.error('[ BOARD : startMiniGameRequest ] ERRROR ==>> ', e);
    }
  }

  /**
   * 턴 종료 요청 및 알림
   * @param {String} sessionId
   */
  async turnEnd(sessionId) {
    try {
      const boardId = await redis.getUserLocationField(sessionId, 'board');
      const sessionIds = await redis.getBoardPlayers(boardId);
      logger.info(`[ BOARD: turnEnd ] boardId: ${boardId} sessionIds ==>> `, sessionIds);

      const result = await redis.transaction.turnEnd(sessionId, boardId);

      logger.info('[ BOARD: turnEnd ] result ==>> ', result);

      if (result.isGameOver || sessionIds.length < 2) {
        // * 대기방 초기화
        const userLocation = await redis.getUserLocation(sessionId);
        const roomData = await redis.getRoom(userLocation.room);
        await redis.updateRoomField(roomData.roomId, 'state', 0);
        await redis.updateRoomField(roomData.roomId, 'readyUsers', '[]');
        result.isGameOver = true;
      }

      return {
        data: {
          sessionIds,
          isGameOver: result.isGameOver,
          rank: result.rank,
        },
      };
    } catch (e) {
      logger.error('[ BOARD : turnEnd ] ERRROR ==>> ', e);
    }
  }

  /**
   * TODO: [ TEST ] redis 값 읽어서 리턴
   */
  async getMiniGameChannel() {
    const result = await redis.getMiniGameChannel();
    return String(result).toUpperCase();
  }

  /**
   * * 보드 - 유저 골드 동기화 패킷 생성
   *  S2C_BoardGoldSyncNotification: 82
   * @param {String} boardId
   * @returns buffer
   */
  async makeBoardPlayersGoldSyncNoti(boardId) {
    logger.info('[ BOARD: makeBoardPlayersGoldSyncNoti ] boardId ===>>> ', boardId);

    const sessionIds = await redis.getBoardPlayers(boardId);

    const type = MESSAGE_TYPE.BOARD_GOLD_SYNC_NOTIFICATION;
    const payload = [];

    for (let i = 0; i < sessionIds.length; i++) {
      const sessionId = sessionIds[i];
      const redisBoardPlayerData = await redis.getBoardPlayerinfo(boardId, sessionId);

      const boardPlayerData = {
        sessionId,
        gold: Number(redisBoardPlayerData.gold),
        trophy: Number(redisBoardPlayerData.trophy),
        tileLocation: Number(redisBoardPlayerData.tileLocation),
      };

      payload.push(boardPlayerData);
    }
    logger.info('[ BOARD: makeBoardPlayersGoldSyncNoti ] payload ===>>> ', payload);

    const buffer = serializeForGate(type, { playersInfo: payload }, 0, sessionIds);
    return buffer;
  }
} //* class end

const boardManagerInstance = BoardManager.getInstance();
Object.freeze(boardManagerInstance);

export default boardManagerInstance;
