import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// SQL_DB
export const USER_DB1_NAME = process.env.USER_DB1_NAME;
export const USER_DB1_USER = process.env.USER_DB1_USER;
export const USER_DB1_PASSWORD = process.env.USER_DB1_PASSWORD;
export const USER_DB1_HOST = process.env.USER_DB1_HOST;
export const USER_DB1_PORT = process.env.USER_DB1_PORT;

// REDIS
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const DISTRIBUTOR_HOST = process.env.DISTRIBUTOR_HOST || 'localhost';
