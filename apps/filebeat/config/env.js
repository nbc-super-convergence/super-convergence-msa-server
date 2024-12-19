import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.resolve(__dirname, '../../.env') });

dotenv.config();

// ELK SERVER
export const ELK_HOST = process.env.LOGSTASH_HOST || 'localhost';
export const ELK_PORT = process.env.LOGSTASH_PORT || 50011;
