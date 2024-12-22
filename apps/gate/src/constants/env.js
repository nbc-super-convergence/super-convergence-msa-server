import dotenv from 'dotenv';

dotenv.config();

// SERVER
export const SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export const DISTRIBUTOR_HOST = process.env.DISTRIBUTOR_HOST || 'localhost';

// LOGSTASH SERVER
export const LOGSTASH_HOST = process.env.LOGSTASH_HOST || 'localhost';
export const LOGSTASH_PORT = process.env.LOGSTASH_PORT || 50011;
