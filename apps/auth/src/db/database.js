import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db.config.js';

const createPool = () => {
  const pool = mysql.createPool({
    ...dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const originalQuery = pool.query;

  pool.query = (sql, params) => {
    return originalQuery.call(pool, sql, params);
  };

  return pool;
};

const dbPool = createPool();

export default dbPool;
