export const MESSAGE_TYPE_LENGTH = 2;
export const VERSION_LENGTH = 1;
export const SEQUENCE_LENGTH = 4;
export const PAYLOAD_LENGTH = 4;

export const MESSAGE_TYPE = {
  // * Auth [1 - 9]
  REGISTER_REQUEST: 1,
  REGISTER_RESPONSE: 2,
  LOGIN_REQUEST: 3,
  LOGIN_RESPONSE: 4,
  LOGOUT_REQUEST: 5,
};
