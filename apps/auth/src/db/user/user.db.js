import dbPool from '../database.js';
import { USER_QUERIES } from './user.queries.js';

export const findUserId = async (login_id) => {
  const [rows] = await dbPool.query(USER_QUERIES.FIND_USER_BY_ID, [login_id]);
  return rows[0];
};

export const createUser = async (login_id, password, nickname) => {
  await dbPool.query(USER_QUERIES.CREATE_USER, [login_id, password, nickname]);
  return { login_id, password, nickname };
};
