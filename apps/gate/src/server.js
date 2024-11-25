import GateServer from './classes/models/gate.server.class.js';

const SERVER_NAME = 'gate';
const SERVER_PORT = 7011;
const server = new GateServer(SERVER_NAME, SERVER_PORT);

await server.start();
