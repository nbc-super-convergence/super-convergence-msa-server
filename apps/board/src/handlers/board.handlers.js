import { serializeForGate } from '@repo/common/utils';
import boardManager from '../classes/managers/board.manager.class.js';
import { MESSAGE_TYPE } from '@repo/common/header';
import { handleError } from '../utils/errors/handle.error.js';
import { logger } from '../utils/logger.utils.js';

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
  const { sessionId, turn } = payload;
  //
  logger.info(' [ BOARD: gameStartRequestHandler ] sessionId ===>> ', sessionId);

  let sessionIds = [sessionId];

  try {
    // * 보드 게임 방, 플레이어 리스트 생성 및 보드 채널 published
    const result = await boardManager.createBoard(sessionId, turn);
    sessionIds = result.data.users;

    // * 게임 인원 전체에게 Noti
    const notification = {
      success: result.success,
      players: result.data.players,
      failCode: result.failCode,
    };
    const messageType = MESSAGE_TYPE.GAME_START_NOTIFICATION;
    const packet = serializeForGate(messageType, notification, 0, sessionIds);
    socket.write(packet);
  } catch (err) {
    logger.error('[ BOARD: gameStartRequestHandler ] ERROR ==>> ', err);
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
   * 2. 해당 값을 나머지 인원에게 전달
   * 3. 해당 값을 본인에게 전달
   * TODO: 4. 업적용 이력 저장
   */
  const { sessionId } = payload;

  let sessionIds = [sessionId];
  try {
    // * 주사위 던짐
    const result = await boardManager.rollDice(sessionId);

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
      sessionIds,
    );
    socket.write(notificationPacket);

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.ROLL_DICE_RESPONSE;
    const response = {
      success: result.success,
      diceResult: result.data.diceResult,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);

    // * 업적용 이력 저장
  } catch (err) {
    logger.error('[ BOARD: rollDiceRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.ROLL_DICE_RESPONSE, sessionIds, err);
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
export const movePlayerBoardRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 여기로 이동하곘다 요청
   * 2. 나머지 플레이어에게 알림 전달
   * 3. 요청 플레이어에게 확인 응답
   * TODO: 4. [업적용] 플레이어 이동 위치 저장
   */
  const { sessionId, targetPoint, rotation } = payload;

  let sessionIds = [sessionId];
  try {
    const result = await boardManager.movePlayerInBoard(sessionId, targetPoint);

    // * 나머지 NOTIFICATION
    sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);

    logger.info('[ BOARD: movePlayerBoardRequestHandler ] sessionIds ===>> ', sessionIds);

    const notificationMessageType = MESSAGE_TYPE.MOVE_PLAYER_BOARD_NOTIFICATION;
    const notification = {
      sessionId: sessionId,
      targetPoint: result.data.targetPoint,
      rotation: rotation,
    };

    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.MOVE_PLAYER_BOARD_RESPONSE;
    const response = {
      success: result.success,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);
  } catch (err) {
    logger.error('[ BOARD: movePlayerBoardRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.MOVE_PLAYER_BOARD_RESPONSE, sessionIds, err);
  }
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
export const purchaseTileRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 타일 구매 요청
   * TODO: 2. 구매에 따른 로직 처리 [ 골드 감소, 타일 정보 수정 등 ]
   * 3. 타일 구매 알림
   * 4. 타일 구매 응답
   */

  const { sessionId, tile } = payload;

  let sessionIds = [sessionId];
  try {
    const result = await boardManager.purchaseTileInBoard(sessionId, tile);

    // * 나머지 NOTIFICATION
    sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.PURCHASE_TILE_NOTIFICATION;
    const notification = {
      sessionId: sessionId,
      tile: result.data.tile,
      playersInfo: result.data.playersInfo,
      purchaseGold: result.data.purchaseGold,
    };

    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.PURCHASE_TILE_RESPONSE;
    const response = {
      success: result.success,
      tile: result.data.tile,
      playerInfo: result.data.playerInfo,
      purchaseGold: result.data.purchaseGold,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);
  } catch (err) {
    logger.error('[ BOARD: purchaseTileRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.PURCHASE_TILE_RESPONSE, sessionIds, err);
  }
};

/**
 * * 대기실로 되돌아 가기 요청
 * * MESSAGE_TYPE.BACK_TO_THE_ROOM_REQUEST
 * * board.C2S_BackToTheRoomRequest
 *
 * * => 응답 [ MESSAGE_TYPE.BACK_TO_THE_ROOM_RESPONSE, board.S2C_BackToTheRoomResponse]
 * * => 알림 [ MESSAGE_TYPE.BACK_TO_THE_ROOM_NOTIFICATION, board.S2C_BackToTheRoomNotification]
 */
export const backToTheRoomRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 대기방 이동 요청
   * 2. 대기방 이동 응답
   * 3. 대기방 이동 알림
   */

  const { sessionId } = payload;
  let sessionIds = [sessionId];
  try {
    logger.info(' [ BOARD: backToTheRoomRequestHandler ] sessionId ===>> ', sessionId);

    const result = await boardManager.backTotheRoom(sessionId);

    logger.info(' [ BOARD: backToTheRoomRequestHandler ] result ===>> ', result);

    // * 나머지 NOTIFICATION
    sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.BACK_TO_THE_ROOM_NOTIFICATION;
    const notification = {
      sessionId: sessionId,
    };

    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.BACK_TO_THE_ROOM_RESPONSE;
    const response = {
      success: result.success,
      room: result.data.room,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);
  } catch (err) {
    logger.error('[ BOARD: backToTheRoomRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.BACK_TO_THE_ROOM_RESPONSE, sessionIds, err);
  }
};

/**
 * * 미니게임 시작 요청, 미니게임 지정해서 알림
 * * MESSAGE_TYPE.?
 * * board.C2S_StartMiniGameRequest
 *
 * * => 알림 [ MESSAGE_TYPE.BACK_TO_THE_ROOM_NOTIFICATION, board.S2C_StartMiniGameNotification]
 */
export const startMiniGameRequestHandler = async ({ socket, payload }) => {
  // TODO: 알맞는 게임타입에 맞추어서 publish 처리
  const { sessionId } = payload;

  try {
    logger.info('[ BOARD: startMiniGameRequestHandler ] sessionId ===>>>  ', sessionId);
    await boardManager.startMiniGameRequest(sessionId);
  } catch (err) {
    logger.error('[ BOARD: startMiniGameRequestHandler ] ERROR ==>> ', err);
  }
};

/**
 * * 트로피 구매 요청
 * * MESSAGE_TYPE.PURCHASE_TROPHY_REQUEST
 *
 * * => 응답 [ PURCHASE_TROPHY_RESPONSE ]
 * * => 알림 [ PURCHASE_TROPHY_NOTIFICATION ]
 */
export const purchaseTrophyRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 트로피 구매 요청 [ sessionId, tile ]
   * 2. 플레이어 골드 감소,
   * 3. 플레이어 트로피 개수 증가,
   * 4. 트로피 타일 해제 및 새로운 트로피 타일 생성
   * 5. 트로피 구매 응답
   * 6. 트로피 구매 알림
   */
  const { sessionId, tile } = payload;
  let sessionIds = [sessionId];

  try {
    //
    const result = await boardManager.purchaseTrophy(sessionId, tile);

    // * 나머지 NOTIFICATION
    sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.PURCHASE_TROPHY_NOTIFICATION;
    const notification = {
      sessionId: sessionId,
      beforeTile: tile,
      nextTile: result.data.nextTile,
      playersInfo: result.data.playersInfo,
    };

    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.PURCHASE_TROPHY_RESPONSE;
    const response = {
      success: result.success,
      nextTile: result.data.nextTile,
      playerInfo: result.data.boardPlayerInfo,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);
  } catch (err) {
    logger.error('[ BOARD: purchaseTrophyRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.PURCHASE_TROPHY_RESPONSE, sessionIds, err);
  }
};

/**
 * * 벌금 처리 요청
 * * TILE_PENALTY_REQUEST
 * TODO: 추가 작업 필요
 *
 * * => 응답 [ TILE_PENALTY_RESPONSE ]
 * * => 알림 [ TILE_PENALTY_NOTIFICATION ]
 */
export const tilePenaltyRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 벌금 처리 요청
   * 2. 대상 금액 감소, 타일 주인 금액 상승
   * 3. 벌금 처리 응답
   * 4. 벌금 처리 알림
   */

  const { sessionId, tile } = payload;
  let sessionIds = [sessionId];

  try {
    const result = await boardManager.tilePenalty(sessionId, tile);

    logger.info('[ BOARD: tilePenaltyRequestHandler ] result ===>>> ', result);

    // * 나머지 NOTIFICATION
    sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);
    const notificationMessageType = MESSAGE_TYPE.TILE_PENALTY_NOTIFICATION;
    const notification = {
      sessionId: sessionId,
      tile: result.data.tile,
      playersInfo: result.data.playersInfo,
    };
    const notificationPacket = serializeForGate(
      notificationMessageType,
      notification,
      0,
      sessionIds,
    );
    socket.write(notificationPacket);

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.TILE_PENALTY_RESPONSE;
    const response = {
      success: result.success,
      playersInfo: result.data.playersInfo,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);
  } catch (err) {
    logger.error('[ BOARD: tilePenaltyRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.TILE_PENALTY_RESPONSE, sessionIds, err);
  }
};

/**
 * * 첫 주사위 순서 게임 결과 요청 ( 다트 게임 )
 * * DICE_GAME_REQUEST , C2S_DiceGameRequest
 *
 * * => 응답 [ DICE_GAME_RESPONSE ]
 * * => 알림 [ DICE_GAME_NOTIFICATION ]
 */
export const firstDiceGameRequestHandler = async ({ socket, payload }) => {
  /**
   * 1. 첫 주사위 순서 게임 결과
   * 2. 주사위 순서 게임 로직 처리
   * 3. 게임 결과 응답
   * 4. 게임 결과 알림
   */
  const { sessionId, distance, angle, location, power } = payload;
  let sessionIds = [sessionId];
  try {
    const dartData = {
      distance,
      angle,
      location,
      power,
    };

    // TODO: 주사위 순서 게임은 어떤 게임인가...?
    const result = await boardManager.firstDiceGame(sessionId, dartData);

    logger.info('[ BOARD: diceGameRequestHandler ] result ===>>> ', result);

    // response는 무조건

    // * RESPONSE
    sessionIds = [sessionId];
    const responseMessageType = MESSAGE_TYPE.DICE_GAME_RESPONSE;
    const response = {
      success: result.success,
      failCode: result.failCode,
    };
    const responsePacket = serializeForGate(responseMessageType, response, 0, sessionIds);
    socket.write(responsePacket);

    if (result.data.isOk) {
      // * 전체 NOTIFICATION
      sessionIds = result.data.sessionIds;
      const notificationMessageType = MESSAGE_TYPE.DICE_GAME_NOTIFICATION;
      const notification = {
        result: result.data.rank,
      };
      const notificationPacket = serializeForGate(
        notificationMessageType,
        notification,
        0,
        sessionIds,
      );
      socket.write(notificationPacket);
    }
  } catch (err) {
    logger.error('[ BOARD: diceGameRequestHandler ] ERROR ==>> ', err);
    handleError(socket, MESSAGE_TYPE.DICE_GAME_RESPONSE, sessionIds, err);
  }
};

export const closeSocketRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;
  let sessionIds = [sessionId];

  try {
    logger.info('[ BOARD: closeSocketRequestHandler ] sessionId ==>> ', sessionId);
  } catch (err) {
    logger.error('[ BOARD: closeSocketRequestHandler ] ERROR ==>> ', err);
  }
};

/**
 * * 턴 종료 요청
 * * TURN_END_REQUEST C2S_TurnEndRequest
 *
 * * => 알림 [ S2C_TurnEndNotification ]
 */
export const turnEndRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;
  let sessionIds = [sessionId];

  try {
    logger.info('[ BOARD: turnEndRequestHandler ] sessionId ==>> ', sessionId);

    // * 턴 종료
    const result = await boardManager.turnEnd(sessionId);

    logger.info('[ BOARD: turnEndRequestHandler ] result ==>> ', result);

    if (result.data.isGameOver) {
      // * 전체 NOTI [ 게임종료 ]
      // * 나머지 NOTIFICATION [ 턴 종료 ]
      sessionIds = result.data.sessionIds;
      const notificationMessageType = MESSAGE_TYPE.GAME_END_NOTIFICATION;
      const notification = {};
      const notificationPacket = serializeForGate(
        notificationMessageType,
        notification,
        0,
        sessionIds,
      );
      socket.write(notificationPacket);
    } else {
      // * 나머지 NOTIFICATION [ 턴 종료 ]
      sessionIds = result.data.sessionIds.filter((sId) => sId !== sessionId);
      const notificationMessageType = MESSAGE_TYPE.TURN_END_NOTIFICATION;
      const notification = {};
      const notificationPacket = serializeForGate(
        notificationMessageType,
        notification,
        0,
        sessionIds,
      );
      socket.write(notificationPacket);
    }
  } catch (err) {
    logger.error('[ BOARD: turnEndRequestHandler ] ERROR ==>> ', err);
  }
};
