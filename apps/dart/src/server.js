import { SERVER_HOST, DISTRIBUTOR_HOST } from './constants/env.js';
import { MESSAGE_TYPE } from '@repo/common/header';
import DartServer from './classes/models/dart.server.class.js';

const SERVER_NAME = 'dart';
const SERVER_PORT = 7020;

const dartMessages = Object.values(MESSAGE_TYPE).filter((value) => value >= 601 && value <= 611);

const server = new DartServer(SERVER_NAME, SERVER_HOST, SERVER_PORT, dartMessages);

await server.start();

server.connectToDistributor(DISTRIBUTOR_HOST, 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
