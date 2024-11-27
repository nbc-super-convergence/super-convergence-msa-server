import { MESSAGE_TYPE } from '../constants/header.js';
import { loginRequestHandler, registerRequestHandler } from './auth/auth.handler.js';
import { logoutHandler } from './auth/logout.handler.js';

const handlers = {
  // * REQUEST
  [MESSAGE_TYPE.REGISTER_REQUEST]: {
    handler: registerRequestHandler,
    message: 'auth.C2S_RegisterRequest',
    payload: 'registerRequest',
  },
  [MESSAGE_TYPE.LOGIN_REQUEST]: {
    handler: loginRequestHandler,
    message: 'auth.C2S_LoginRequest',
    payload: 'loginRequest',
  },
  [MESSAGE_TYPE.LOGOUT_REQUEST]: {
    handler: logoutHandler,
    message: 'auth.C2S_LoggoutRequest',
    payload: 'logoutRequest',
  },

  // * RESPONSE [handler X]
  [MESSAGE_TYPE.REGISTER_RESPONSE]: {
    handler: undefined,
    message: 'auth.S2C_RegisterResponse',
    payload: 'registerResponse',
  },
  [MESSAGE_TYPE.LOGIN_RESPONSE]: {
    handler: undefined,
    message: 'auth.S2C_LoginResponse',
    payload: 'loginResponse',
  },

  // * NOTIFICATION [handler X]
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
