import AuthServer from "./classes/models/auth.server.class.js";


const SERVER_NAME = "Auth";
const SERVER_PORT = 5560;
const server = new AuthServer(SERVER_NAME, SERVER_PORT, [1, 2, 3, 4, 5]);

await server.start();
server.connectToDistributor("127.0.0.1", 9000, (data) => {
  // Distributor 연결
  console.log("Distributor Notification", data);
});
