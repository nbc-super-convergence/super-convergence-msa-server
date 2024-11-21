import GateServer from "./classes/models/gate.server.class.js";

const SERVER_NAME = "gate";
const SERVER_PORT = 5555;
const gateServer = new GateServer(SERVER_NAME, SERVER_PORT);

gateServer.start();
