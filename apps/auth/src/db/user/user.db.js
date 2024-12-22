import dbPool from '../database.js';
import { USER_QUERIES } from './user.queries.js';

export const findUserId = async (loginId) => {
  const [rows] = await dbPool.query(USER_QUERIES.FIND_USER_BY_ID, [loginId]);
  return rows[0];
};

export const findUserNickname = async (nickname) => {
  const [rows] = await dbPool.query(USER_QUERIES.FIND_USER_BY_NICKNAME, [nickname]);
  return rows[0];
};

export const createUser = async (loginId, password, nickname) => {
  await dbPool.query(USER_QUERIES.CREATE_USER, [loginId, password, nickname]);
  return { loginId, password, nickname };
};
