import { TcpServer } from "@repo/common/classes";

const SERVER_NAME = "ice";
const SERVER_PORT = 5561;
const server = new TcpServer(SERVER_NAME, SERVER_PORT);

await server.start();
server.connectToDistributor("127.0.0.1", 9000, (data) => {
  // Distributor 연결
  console.log("Distributor Notification", data);
});
