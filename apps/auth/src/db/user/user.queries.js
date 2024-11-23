export const USER_QUERIES = {
  FIND_USER_BY_ID: 'SELECT * FROM users WHERE login_id = ?',
  CREATE_USER: 'INSERT INTO users (login_id,password,nickname) VALUES (?, ?, ?)',
};
