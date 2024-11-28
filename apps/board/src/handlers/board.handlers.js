import { serializeForGate } from '@repo/common/utils';
import { redis } from '../utils/redis.js';
import boardManager from '../classes/managers/board.manager.class.js';
import { FAIL_CODE } from '@repo/common/failcodes';
import { MESSAGE_TYPE } from '@repo/common/header';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { handleError } from '../utils/errors/handle.error.js';

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
   * 1. sessionId로 redis에서 유저 정보 및 룸 정보 조회
   * 2. 해당 유저가 방장(room owner)인지 확인 [ 방장만 요청 가능 ]
   * 3. 게임 세션 생성 및 방 유저 추가 작업[ redis pub ]
   * 4. 생성된 게임 세션 유저 모두에게 게임 시작 알림
   */
  const { sessionId } = payload;
  //
  console.log(' [ BOARD: gameStartRequestHandler ] sessionId ===>> ', sessionId);

  let sessionIds = [sessionId];

  try {
    // * 보드 게임 방, 플레이어 리스트 생성 및 보드 채널 published
    const result = await boardManager.createBoard(sessionId);

    try {
      sessionIds = JSON.parse(result.data.users);
      console.log(' [ BOARD: gameStartRequestHandler ] sessionIds  ===>>> ', sessionIds);
    } catch (e) {
      sessionIds = [sessionId];
    }

    // * 게임 인원 전체에게 Noti
    const notification = { success: result.success, players: [], failCode: result.failCode };
    const messageType = MESSAGE_TYPE.GAME_START_NOTIFICATION;
    const packet = serializeForGate(
      messageType,
      notification,
      0,
      getPayloadNameByMessageType(messageType),
      sessionIds,
    );
    socket.write(packet);
  } catch (err) {
    console.error('[ BOARD: gameStartRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.GAME_START_NOTIFICATION, sessionIds, err);
  }
};

/**
 * * 주사위 굴림 요청
 * * MESSAGE_TYPE.ROLL_DICE_REQUEST
 * * board.C2S_RollDiceRequest
 *
 * * => 응답 [ MESSAGE_TYPE.ROLL_DICE_RESPONSE, board.S2C_RollDiceResponse]
 * * => 알림 [ MESSAGE_TYPE.ROLL_DICE_NOTIFICATION, board.S2C_RollDiceNotification]
 */
export const rollDiceRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 주사위를 던짐 randome값 처리 (dice.util)
   * 2. 해당 값을 본인에게 전달
   * 3. 해당 값을 나머지 인원에게 전달
   */
  const { sessionId } = payload;

  let sessionIds = [sessionId];
  try {
    // * 주사위 던짐
    const result = await boardManager.rollDice(sessionId);

    // * RESPONSE
    const responseMessageType = MESSAGE_TYPE.ROLL_DICE_RESPONSE;
    const response = {
      success: result.success,
      diceResult: result.data.diceResult,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(
      responseMessageType,
      response,
      0,
      getPayloadNameByMessageType(responseMessageType),
      sessionIds,
    );
    socket.write(responsePacket);

    // * 나머지 NOTIFICATION
    sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.ROLL_DICE_NOTIFICATION;
    const notification = {
      sessionId: sessionId,
      diceResult: result.data.diceResult,
    };

    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      getPayloadNameByMessageType(notificationMessageType),
      sessionIds,
    );
    socket.write(notificationPacket);
  } catch (err) {
    console.error('[ BOARD: rollDiceRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.ROLL_DICE_NOTIFICATION, sessionIds, err);
  }
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
