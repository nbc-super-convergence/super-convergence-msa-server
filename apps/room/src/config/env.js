import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

dotenv.config();

export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = process.env.REDIS_PORT;
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_USERNAME = process.env.REDIS_USERNAME;
export const REDIS_USERPASS = process.env.REDIS_USERPASS;

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const DISTRIBUTOR_HOST = process.env.DISTRIBUTOR_HOST || 'localhost';

console.log('Loaded environment variables:', {
  REDIS_HOST: REDIS_HOST,
  REDIS_PORT: REDIS_HOST,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_USERPASS: process.env.REDIS_USERPASS,
  SERVER_HOST: process.env.SERVER_HOST,
  DISTRIBUTOR_HOST: process.env.DISTRIBUTOR_HOST,
  // ... 다른 환경변수들
});
