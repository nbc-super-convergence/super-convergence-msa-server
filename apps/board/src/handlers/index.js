import { MESSAGE_TYPE } from '../constants/header.js';
import { logger } from '../utils/logger.utils.js';
import {
  backToTheRoomRequestHandler,
  firstDiceGameRequestHandler,
  gameStartRequestHandler,
  movePlayerBoardRequestHandler,
  purchaseTileRequestHandler,
  purchaseTrophyRequestHandler,
  rollDiceRequestHandler,
  startMiniGameRequestHandler,
  tilePenaltyRequestHandler,
  turnEndRequestHandler,
} from './board.handlers.js';

//
const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.GAME_START_REQUEST]: { handler: gameStartRequestHandler },
  [MESSAGE_TYPE.ROLL_DICE_REQUEST]: { handler: rollDiceRequestHandler },
  [MESSAGE_TYPE.MOVE_PLAYER_BOARD_REQUEST]: { handler: movePlayerBoardRequestHandler },
  [MESSAGE_TYPE.PURCHASE_TILE_REQUEST]: { handler: purchaseTileRequestHandler },
  [MESSAGE_TYPE.BACK_TO_THE_ROOM_REQUEST]: { handler: backToTheRoomRequestHandler },
  [MESSAGE_TYPE.PURCHASE_TROPHY_REQUEST]: { handler: purchaseTrophyRequestHandler },
  [MESSAGE_TYPE.TILE_PENALTY_REQUEST]: { handler: tilePenaltyRequestHandler },
  [MESSAGE_TYPE.DICE_GAME_REQUEST]: { handler: firstDiceGameRequestHandler },
  [MESSAGE_TYPE.TURN_END_REQUEST]: { handler: turnEndRequestHandler },

  [MESSAGE_TYPE.START_MINI_GAME_REQUEST]: { handler: startMiniGameRequestHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    logger.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
