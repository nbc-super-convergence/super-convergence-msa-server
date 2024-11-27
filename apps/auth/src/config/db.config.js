import {
  USER_DB1_HOST,
  USER_DB1_NAME,
  USER_DB1_PASSWORD,
  USER_DB1_PORT,
  USER_DB1_USER,
} from '../constants/env.js';

export const dbConfig = {
  database: {
    database: USER_DB1_NAME,
    host: USER_DB1_HOST,
    password: USER_DB1_PASSWORD,
    port: USER_DB1_PORT,
    user: USER_DB1_USER,
  },
};
