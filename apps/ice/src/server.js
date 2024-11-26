import IceServer from './classes/models/ice.server.class.js';
import { addGameSession } from './sessions/game.session.js';

const SERVER_NAME = 'ice';
const SERVER_PORT = 7016;
const server = new IceServer(SERVER_NAME, SERVER_PORT, [555]);

await server.start();

// TODO: 서버에서 게임 시작 요청이 들어올 때 게임 세션을 생성하는 걸로 변경해야함!
await addGameSession();

server.connectToDistributor('127.0.0.1', 7010, (data) => {
  // Distributor 연결
  console.log('Distributor Notification', data);
});
