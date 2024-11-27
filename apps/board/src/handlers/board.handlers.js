import { RedisClient } from '@repo/common/classes';
import { serializeForGate } from '@repo/common/utils';

/**
 * * 게임 시작 요청 (방장만 가능)
 * * MESSAGE_TYPE.GAME_START_REQUEST
 * * board.C2S_GameStartRequest
 *
 * * => 게임 시작 알림 [ MESSAGE_TYPE.GAME_START_NOTIFICATION, board.S2C_GameStartNotification]
 * * => 게임 종료 알림 [ MESSAGE_TYPE.GAME_END_NOTIFICATION, board.S2C_GameEndNotification]
 */
export const gameStartRequestHandler = async ({ socket, payload }) => {
  /**
   * *  [ redis ice에 pub/sub으로 진행? ]
   * 1. sessionId로 redis에서 유저 정보 및 룸 정보 조회
   * 2. 해당 유저가 방장(room owner)인지 확인 [ 방장만 요청 가능 ]
   * 3. 게임 세션 생성 및 방 유저 추가 작업
   * 4. 생성된 게임 세션 유저 모두에게 게임 시작 알림
   */
  const { sessionId } = payload;
  //
  console.log(' [ gameStartRequestHandler ] sessionId ===>> ', sessionId);

  // TODO: [ TEST : GATE ] ------------------------------

  const packet = serializeForGate(
    62,
    {
      success: true,
      diceResult: 10,
      failCode: 0,
    },
    1,
    'rollDiceResponse',
    [sessionId],
  );
  socket.write(packet);

  // ------------------------------

  // * redis에서 유저 정보 조회
  // userId, nickname, location
  //   const userObj = redis.getUserToSession(sessionId);

  // * redis에서 유저 roomId 조회

  // * room 정보 조회
};

/**
 * * 주사위 굴림 요청
 * * MESSAGE_TYPE.ROLL_DICE_REQUEST
 * * board.C2S_RollDiceRequest
 *
 * * => 응답 [ MESSAGE_TYPE.ROLL_DICE_RESPONSE, board.S2C_RollDiceResponse]
 * * => 알림 [ MESSAGE_TYPE.ROLL_DICE_NOTIFICATION, board.S2C_RollDiceNotification]
 */
export const rollDiceRequestHandler = ({ socket, payload }) => {
  //
};

/**
 * * 플레이어 이동 요청
 * * MESSAGE_TYPE.MOVE_PLAYER_BOARD_REQUEST
 * * board.C2S_MovePlayerBoardRequest
 *
 * * => 응답 [ MESSAGE_TYPE.MOVE_PLAYER_BOARD_RESPONSE, board.S2C_MovePlayerBoardResponse]
 * * => 알림 [ MESSAGE_TYPE.MOVE_PLAYER_BOARD_NOTIFICATION, board.S2C_MovePlayerBoardNotification]
 */
export const movePlayerBoardRequestHandler = ({ socket, payload }) => {
  //
};

/**
 * * 타일 구매 이벤트 요청
 * TODO: 다른 이벤트 처리 패킷 및 핸들러도 만들어야함
 * * MESSAGE_TYPE.PURCHASE_TILE_REQUEST
 * * board.C2S_PurchaseTileRequest
 *
 * * => 응답 [ MESSAGE_TYPE.PURCHASE_TILE_RESPONSE, board.S2C_PurchaseTileResponse]
 * * => 알림 [ MESSAGE_TYPE.PURCHASE_TILE_NOTIFICATION, board.S2C_PurchaseTileNotification]
 */
export const purchaseTileRequestHandler = ({ socket, payload }) => {
  //
};

/**
 * * 대기실로 되돌아 가기 요청
 * * MESSAGE_TYPE.BACK_TO_THE_ROOM_REQUEST
 * * board.C2S_BackToTheRoomRequest
 *
 * * => 응답 [ MESSAGE_TYPE.BACK_TO_THE_ROOM_RESPONSE, board.S2C_BackToTheRoomResponse]
 * * => 알림 [ MESSAGE_TYPE.BACK_TO_THE_ROOM_NOTIFICATION, board.S2C_BackToTheRoomNotification]
 */
export const backToTheRoomRequestHandler = ({ socket, payload }) => {
  //
};
