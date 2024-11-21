import { loadProtos } from "@repo/common/init/load.protos.js";
import DistributorServer from "./classes/models/distributor.server.js";

// TODO: 더 있으면 initServer로 변경
await loadProtos();

const server = new DistributorServer();
server.start();
