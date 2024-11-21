import GateServer from "./classes/models/gate.server.class.js";

const SERVER_NAME = "gate";
const SERVER_PORT = 5555;
const server = new GateServer(SERVER_NAME, SERVER_PORT);

await server.start();
server.connectToDistributor("127.0.0.1", 9000, (data) => {
  // Distributor 연결
  console.log("Distributor Notification", data);
});
