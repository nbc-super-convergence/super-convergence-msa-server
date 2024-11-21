import TcpServer from "@repo/common/classes/models/server.class.js";
import { loadProtos } from "@repo/common/init/load.protos.js";

const SERVER_NAME = "ice";
const SERVER_PORT = 5561;
const server = new TcpServer(SERVER_NAME, SERVER_PORT);

// TODO: 더 있으면 initServer로 변경
await loadProtos();

server.start();
server.connectToDistributor("127.0.0.1", 9000, (data) => {
  // Distributor 연결
  console.log("Distributor Notification", data);
});
