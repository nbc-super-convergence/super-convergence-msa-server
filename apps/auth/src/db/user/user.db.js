import dbPool from '../database.js';
import { USER_QUERIES } from './user.queries.js';

export const findUserId = async (id) => {
  const [rows] = await dbPool.query(USER_QUERIES.FIND_USER_BY_ID, [id]);
  return rows[0];
};

export const createUser = async (id, password, nick) => {
  await dbPool.query(USER_QUERIES.CREATE_USER, [id, password, nick]);
  return { id, password, nick };
};
