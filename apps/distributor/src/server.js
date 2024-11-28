import DistributorServer from './classes/models/distributor.server.js';

const server = new DistributorServer();
await server.start();
