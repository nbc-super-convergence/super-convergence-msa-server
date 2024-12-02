import { MESSAGE_TYPE } from '../constants/header.js';
import {
  backToTheRoomRequestHandler,
  diceGameRequestHandler,
  gameStartRequestHandler,
  movePlayerBoardRequestHandler,
  purchaseTileRequestHandler,
  purchaseTrophyRequestHandler,
  rollDiceRequestHandler,
  tilePenaltyRequestHandler,
} from './board.handlers.js';

//
const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.GAME_START_REQUEST]: {
    handler: gameStartRequestHandler,
    message: 'board.C2S_GameStartRequest',
    payload: 'gameStartRequest',
  },
  [MESSAGE_TYPE.ROLL_DICE_REQUEST]: {
    handler: rollDiceRequestHandler,
    message: 'board.C2S_RollDiceRequest',
    payload: 'rollDiceRequest',
  },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_REQUEST]: {
    handler: movePlayerBoardRequestHandler,
    message: 'board.C2S_MovePlayerBoardRequest',
    payload: 'movePlayerBoardRequest',
  },
  [MESSAGE_TYPE.PURCHASE_TILE_REQUEST]: {
    handler: purchaseTileRequestHandler,
    message: 'board.C2S_PurchaseTileRequest',
    payload: 'purchaseTileRequest',
  },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_REQUEST]: {
    handler: backToTheRoomRequestHandler,
    message: 'board.C2S_BackToTheRoomRequest',
    payload: 'backToTheRoomRequest',
  },
  [MESSAGE_TYPE.PURCHASE_TROPHY_REQUEST]: {
    handler: purchaseTrophyRequestHandler,
    message: 'board.C2S_PurchaseTrophyRequest',
    payload: 'purchaseTrophyRequest',
  },
  [MESSAGE_TYPE.TILE_PENALTY_REQUEST]: {
    handler: tilePenaltyRequestHandler,
    message: 'board.C2S_TilePenaltyRequest',
    payload: 'tilePenaltyRequest',
  },
  [MESSAGE_TYPE.DICE_GAME_REQUEST]: {
    handler: diceGameRequestHandler,
    message: 'board.C2S_DiceGameRequest',
    payload: 'diceGameRequest',
  },

  // * RESPONSE [handler X]
  [MESSAGE_TYPE.ROLL_DICE_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_RollDiceResponse',
    payload: 'rollDiceResponse',
  },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_MovePlayerBoardResponse',
    payload: 'movePlayerBoardResponse',
  },
  [MESSAGE_TYPE.PURCHASE_TILE_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_PurchaseTileResponse',
    payload: 'purchaseTileResponse',
  },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_BackToTheRoomResponse',
    payload: 'backToTheRoomResponse',
  },
  [MESSAGE_TYPE.PURCHASE_TROPHY_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_PurchaseTrophyResponse',
    payload: 'purchaseTrophyResponse',
  },
  [MESSAGE_TYPE.TILE_PENALTY_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_TilePenaltyResponse',
    payload: 'tilePenaltyResponse',
  },
  [MESSAGE_TYPE.DICE_GAME_RESPONSE]: {
    handler: undefined,
    message: 'board.S2C_DiceGameResponse',
    payload: 'diceGameResponse',
  },

  // * NOTIFICATION [handler X]
  [MESSAGE_TYPE.GAME_START_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_GameStartNotification',
    payload: 'gameStartNotification',
  },
  [MESSAGE_TYPE.ROLL_DICE_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_RollDiceNotification',
    payload: 'rollDiceNotification',
  },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_MovePlayerBoardNotification',
    payload: 'movePlayerBoardNotification',
  },
  [MESSAGE_TYPE.PURCHASE_TILE_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_PurchaseTileNotification',
    payload: 'purchaseTileNotification',
  },
  [MESSAGE_TYPE.GAME_END_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_GameEndNotification',
    payload: 'gameEndNotification',
  },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_BackToTheRoomNotification',
    payload: 'backToTheRoomNotification',
  },
  [MESSAGE_TYPE.PURCHASE_TROPHY_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_PurchaseTrophyNotification',
    payload: 'purchaseTrophyNotification',
  },
  [MESSAGE_TYPE.TILE_PENALTY_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_TilePenaltyNotification',
    payload: 'tilePenaltyNotification',
  },
  [MESSAGE_TYPE.DICE_GAME_NOTIFICATION]: {
    handler: undefined,
    message: 'board.S2C_DiceGameNotification',
    payload: 'diceGameNotification',
  },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};

export const getProtoTypeNameByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `);
    throw new Error(`프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `);
  }
  return handlers[messageType].message;
};

//
export const getPayloadNameByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`프로토버퍼 메세지를 찾을 수 없습니다 : messageType : [${messageType}] `);
    throw new Error(`프로토버퍼 메세지를 수 없습니다 : messageType : [${messageType}] `);
  }
  return handlers[messageType].payload;
};
