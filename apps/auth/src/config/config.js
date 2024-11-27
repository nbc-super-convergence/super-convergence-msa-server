import {
  MESSAGE_TYPE_LENGTH,
  VERSION_LENGTH,
  PAYLOAD_LENGTH,
  SEQUENCE_LENGTH,
} from '../constants/header.js';

export const config = {
  SERVER_NAME: 'Auth',
  SERVER_PORT: 7012,
  CLIENT: {
    VERSION: '1.0.0',
  },
  PACKET: {
    TOTAL_LENGTH: MESSAGE_TYPE_LENGTH + VERSION_LENGTH + SEQUENCE_LENGTH + PAYLOAD_LENGTH,
    MESSAGE_TYPE_LENGTH: MESSAGE_TYPE_LENGTH,
    VERSION_LENGTH: VERSION_LENGTH,
    SEQUENCE_LENGTH: SEQUENCE_LENGTH,
    PAYLOAD_LENGTH: PAYLOAD_LENGTH,
  },
};
