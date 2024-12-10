import dotenv from 'dotenv';

dotenv.config();

// REDIS
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_USERNAME = process.env.REDIS_USERNAME;
export const REDIS_USERPASS = process.env.REDIS_USERPASS;

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const DISTRIBUTOR_HOST = process.env.DISTRIBUTOR_HOST || 'localhost';
