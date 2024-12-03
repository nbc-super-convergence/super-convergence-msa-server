import { MESSAGE_TYPE } from '../constants/header.js';
import { loginRequestHandler, registerRequestHandler } from './auth/auth.handler.js';
import { logoutHandler } from './auth/logout.handler.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.REGISTER_REQUEST]: { handler: registerRequestHandler },
  [MESSAGE_TYPE.LOGIN_REQUEST]: { handler: loginRequestHandler },
  [MESSAGE_TYPE.LOGOUT_REQUEST]: { handler: logoutHandler },
  [MESSAGE_TYPE.CLOSE_SOCKET_REQUEST]: { handler: logoutHandler },
};

export const getHandlerByMessageType = (messageType) => {
  if (!handlers[messageType]) {
    console.error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
    throw new Error(`핸들러를 찾을 수 없습니다 : messageType : ${messageType}`);
  }
  return handlers[messageType].handler;
};
