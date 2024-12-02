import { FAIL_CODE } from '@repo/common/failcodes';
import { redis } from '../../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { BOARD_STATE } from '../../constants/state.js';
import { getRollDiceResult } from '../../utils/dice.utils.js';

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
   * @param {*} sessionId - 방장 세션 ID
   */
  async createBoard(sessionId) {
    try {
      // * redis에서 유저 정보 조회 [ getUserToSession ]
      const userData = await redis.getUserToSession(sessionId);
      console.log('[ BOARD: gameStartRequestHandler ] userData ===>>> ', userData);

      // * redis에서 유저 roomId 조회
      const userLocation = await redis.getUserLocation(sessionId);
      console.log('[ BOARD: gameStartRequestHandler ] userLocation ===>>> ', userLocation);

      // * room 정보 조회
      const roomData = await redis.getRoom(userLocation.roomId);
      console.log('[ BOARD: gameStartRequestHandler ] roomData ===>>> ', roomData);

      // * 방장만 시작 요청 가능
      if (roomData.ownerSessionId === sessionId) {
        // const playerNumber = Math.floor(Math.random() * 4);
        const board = {
          boardId: uuidv4(),
          roomId: userLocation.roomId,
          ownerId: sessionId,
          users: roomData.users,
          state: BOARD_STATE.WAITING,
        };

        // * redisUtil에서 redisTransaction으로 변경
        await redis.transaction.createBoardGame(board);

        return { success: true, data: roomData, failCode: 0 };
      } else {
        console.error('방장만 게임시작 요청을 할 수 있습니다.', roomData, userData);
        return { success: false, data: null, failCode: FAIL_CODE.INVALID_REQUEST };
      }
    } catch (e) {
      console.error('[ BOARD : createBoard ] ERRROR ==>> ', e);
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
      const DICE_MAX_VALUE = 10;
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
      console.error('[ BOARD : rollDice ] ERRROR ==>> ', e);
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
      console.error('[ BOARD : movePlayerInBoard ] ERRROR ==>> ', e);
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
      const boardId = await this.getUserLocationField(sessionId, 'board');
      const sessionIds = await this.getBoardPlayers(boardId);

      // TODO: 1 - 타일 주인 정보 저장,
      // TODO: 2 - [업적용] 타일 구매이력 저장
      await redis.transaction.createPurchaseTileInfo(boardId, sessionId, tile);

      return {
        success: true,
        data: {
          tile,
          sessionIds,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      console.error('[ BOARD : purchaseTileInBoard ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
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
      return {
        success: true,
        data: {
          room,
          sessionIds,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      console.error('[ BOARD : backTotheRoom ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }

  /**
   * 트로피 구매
   * @param {String} sessionId
   * @param {Number} tile
   */
  async purchaseTrophy(sessionId, tile) {
    //
    let nextTile = tile;
    try {
      const trophyValue = 2; // TODO: 임시 트로피 값
      // * 해당 플레이어 정보 수정
      const boardId = await this.getUserLocationField(sessionId, 'board');
      const boardPlayerInfo = await redis.getBoardPlayerinfo(boardId, sessionIds);
      console.log('[ BOARD: purchaseTrophy ] boardPlayerInfo ===>> ', boardPlayerInfo);

      // * 보유 골드가 트로피 금액보다 높은지?
      if (boardPlayerInfo.gold >= trophyValue) {
        boardPlayerInfo.gold = boardPlayerInfo.gold - trophyValue;
        boardPlayerInfo.trophy++;

        console.log('[ BOARD: purchaseTrophy ] changed boardPlayerInfo ===>> ', boardPlayerInfo);
        await redis.updateBoardPlayerInfo(boardId, sessionId, boardPlayerInfo);

        // TODO: 새로운 트로피 타일 생성, 보드 플레이어 정보 수정이랑 트랜잭션 묶어서 처리?
        nextTile = tile; // TODO: 새로운 타일로 변경 예정
      }

      // * 전달할 플레이어 목록
      const sessionIds = await redis.getBoardPlayersBySessionId(sessionId);
      return {
        success: true,
        data: {
          sessionIds,
          boardPlayerInfo,
          nextTile,
        },
        failCode: FAIL_CODE.NONE_FAILCODE,
      };
    } catch (e) {
      console.error('[ BOARD : purchaseTrophy ] ERRROR ==>> ', e);
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
      const boardId = await this.getUserLocationField(sessionId, 'board');
      const sessionIds = await this.getBoardPlayers(boardId);

      // TODO: 벌급 정해야 함, Game Data에서??
      const penalty = 10;

      /**
       * 1. 벌금 적용
       * 2. 상대방 유저 금액 상승
       */
      const result = await redis.transaction.tilePenalty(boardId, sessionId, tile, penalty);

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
      console.error('[ BOARD : tilePenalty ] ERRROR ==>> ', e);
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }
} //* class end

const boardManagerInstance = BoardManager.getInstance();
Object.freeze(boardManagerInstance);

export default boardManagerInstance;
