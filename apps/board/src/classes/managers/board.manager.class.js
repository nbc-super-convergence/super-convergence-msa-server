import { FAIL_CODE } from '@repo/common/failcodes';
import { redis } from '../../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { BOARD_STATE } from '../../constants/state.js';

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
          state: BOARD_STATE.WAITING,
        };
        await redis.createBoardGame(board);
        return { success: true, data: roomData, failCode: 0 };
      } else {
        console.error('방장만 게임시작 요청을 할 수 있습니다.', roomData, userData);
        return { success: false, data: null, failCode: FAIL_CODE.INVALID_REQUEST };
      }
    } catch (e) {
      return { success: false, data: null, failCode: FAIL_CODE.UNKNOWN_ERROR };
    }
  }
}

const boardManagerInstance = BoardManager.getInstance();
Object.freeze(boardManagerInstance);

export default boardManagerInstance;
