export const USER_QUERIES = {
  FIND_USER_BY_ID: 'SELECT * FROM users WHERE login_id = ?',
  FIND_USER_BY_NICKNAME: 'SELECT * FROM users WHERE nickname = ?',
  CREATE_USER: 'INSERT INTO users (login_id,password,nickname) VALUES (?, ?, ?)',
};
