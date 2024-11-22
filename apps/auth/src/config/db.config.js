import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../constants/env.js';

export const dbConfig = {
  database: {
    database: DB_NAME,
    host: DB_HOST,
    password: DB_PASSWORD,
    port: DB_PORT,
    user: DB_USER,
  },
};
