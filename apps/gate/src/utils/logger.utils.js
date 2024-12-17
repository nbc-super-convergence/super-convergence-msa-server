import { createLogger } from '@repo/common/config';
import { LOGSTASH_HOST, LOGSTASH_PORT } from '../constants/env';

const host = LOGSTASH_HOST;
const port = LOGSTASH_PORT;

export const logger = createLogger('GATE', host, port);
