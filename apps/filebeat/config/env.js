import dotenv from 'dotenv';
dotenv.config();

// ELK SERVER
export const ELK_HOST = process.env.LOGSTASH_HOST || 'localhost';
export const ELK_PORT = process.env.LOGSTASH_PORT || 50011;
