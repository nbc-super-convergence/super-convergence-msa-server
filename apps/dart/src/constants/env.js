import dotenv from 'dotenv';

dotenv.config();

// REDIS
export const REDIS = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  // username: process.env.REDIS_USERNAME,
  // userpass: process.env.REDIS_USERPASS,
};

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const DISTRIBUTOR_HOST = process.env.DISTRIBUTOR_HOST || 'localhost';
