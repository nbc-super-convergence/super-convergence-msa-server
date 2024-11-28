import dotenv from 'dotenv';

dotenv.config();

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
