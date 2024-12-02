import { TcpServer, TcpClient } from '@repo/common/classes';
import { config } from '@repo/common/config';
import {
  createServerInfoNotification,
  deserialize,
  packetParser,
  packetParserForGate,
  serialize,
  serializeForClient,
} from '@repo/common/utils';
import { SERVER_HOST } from '../../constants/env.js';
import { makeLogoutRequest } from '../../utils/request/logout.utils.js';

class GateServer extends TcpServer {
  _map = {};
  _mapServices = {};

  _isConnectedDistributor;
  _clientBuffer = Buffer.alloc(0);

  constructor(name, port) {
    super(name, port, []);
  }

  /**
   * * 게이트서버는 메세지 타입에 맞는 서버로 전송
   * @param {*} socket
   * @returns
   */
  _onData = (socket) => async (data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
      console.log(
        `\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (socket.buffer.length >= length) {
        if (
          messageType === config.MESSAGE_TYPE.REGISTER_REQUEST ||
          messageType === config.MESSAGE_TYPE.LOGIN_REQUEST
        ) {
          // * REGISTER_REQUEST(1) || LOGIN_REQUEST(3)
          // * 로그인 & 회원가입 임시 소켓 id, 헤더 sequence에 삽입
          const packet = socket.buffer.subarray(offset, length);
          const payload = packetParser(messageType, packet);

          console.log('[ GATE : _onData ]  socket.id ====>>> ', socket.id);

          // * 임시 소켓 id, 헤더 sequence에 삽입
          const buffer = serialize(messageType, payload, socket.id);

          // * 연결되어있는 서비스서버의 type에 맞는 메세지 전달
          for (const [key, value] of Object.entries(this._map)) {
            if (value.types.includes(messageType)) {
              // * messageType에 맞는 Client
              const targetService = this._mapServices[key];
              targetService.client.write(buffer);
            }
          }

          socket.buffer = socket.buffer.subarray(length);
        } else {
          // * 로비 입장 시 sessionId로 socket 저장 [ LOBBY_JOIN_REQUEST: 11, ]
          if (messageType === config.MESSAGE_TYPE.LOBBY_JOIN_REQUEST) {
            //
            const packet = socket.buffer.subarray(offset, length);
            const payload = packetParser(messageType, packet);
            console.log('[ Gate - _onData ] payload ===>>> \n', payload);

            // * 저장되어있는 소켓값 삭제
            try {
              console.log(' [ GATE: _onData ] KEYS ===>>> ', Object.keys(this._socketMap));
              const mapKey = Object.keys(this._socketMap).find(
                (key) => this._socketMap[key].socket === socket,
              );
              if (mapKey) {
                delete this._socketMap[mapKey];
              }
            } catch (err) {
              console.error('[ GATE: _onData ] 임시 소켓 삭제 시도 실패, ERR ==>> ', err);
            }

            // * sessionId를 키값으로 socket 저장
            this._socketMap[payload.sessionId] = { socket };
          }

          // * 연결되어있는 서비스서버의 type에 맞는 메세지 전달
          for (const [key, value] of Object.entries(this._map)) {
            if (value.types.includes(messageType)) {
              // * messageType에 맞는 Client
              const targetService = this._mapServices[key];
              targetService.client.write(socket.buffer);
            }
          }
          socket.buffer = socket.buffer.subarray(length);
        }
      } else {
        //
        break;
      }
    }
  };

  _onEnd = (socket) => () => {
    const sessionid = Object.keys(this._socketMap).find(
      (key) => this._socketMap[key].socket === socket,
    );
    console.log(' [ GATE: _onEnd ] 클라이언트 연결이 종료되었습니다. ==>> ', sessionid);

    // * 로그아웃 처리
    const logOutPacket = makeLogoutRequest(sessionid);
    console.log('\n [ GATE: _onEnd ]  [ keys ] ', Object.keys(this._mapServices));
    const targetService = this._mapServices['Auth_1'];
    targetService.client.write(logOutPacket);
  };
  _onError = (socket) => (err) => {
    const sessionid = Object.keys(this._socketMap).find(
      (key) => this._socketMap[key].socket === socket,
    );
    console.error(` [ GATE: _onError ]  소켓 오류가 발생하였습니다.:  ${sessionid} `, err);

    // * 로그아웃 처리
    const logOutPacket = makeLogoutRequest(sessionid);
    console.log('\n [ GATE: _onEnd ]  [ keys ] ', Object.keys(this._mapServices));
    const targetService = this._mapServices['Auth_1'];
    targetService.client.write(logOutPacket);
  };

  _onDistribute = (socket, data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      // deserialized
      const { messageType, version, sequence, offset, length } = deserialize(data);

      if (socket.buffer.length >= length) {
        const packet = socket.buffer.subarray(offset, length);
        socket.buffer = socket.buffer.subarray(length);

        const payload = packetParser(messageType, packet);

        for (let i = 0; i < payload.params.length; i++) {
          const param = payload.params[i];

          const key = param.name + '_' + param.number;

          // TODO: Client 만들어서 맵으로 저장
          const client = new TcpClient(
            param.host,
            param.port,
            this.onCreateClient,
            this.onReadClient,
            this.onEndClient,
            this.onErrorClient,
          );

          this._mapServices[key] = {
            client: client,
            info: param,
          };

          this._map[key] = {
            // socket: socket,
            name: param.name,
            number: param.number,
            host: param.host,
            port: param.port,
            types: param.types,
          };

          // * gate & distributor 제외
          if (param.name !== 'gate' && param.name !== 'distributor') {
            // * 정보받은 서버랑 연결
            client.connect();
          }
        }
      } else {
        break;
      }
    }
  };

  // 마이크로서비스 접속 이벤트 처리
  onCreateClient = (options) => {
    console.log('[ onCreateClient ] options ==> ', options);
  };

  // 마이크로서비스 응답 처리
  // * 서비스 서버에게 받은 데이터
  onReadClient = (options, packet) => {
    console.log('[ gate - onReadClient ] =========> \n', packet);
    this._clientBuffer = Buffer.concat([this._clientBuffer, packet]);

    while (this._clientBuffer.length >= config.PACKET.TOTAL_LENGTH) {
      const { messageType, version, sequence, offset, length } = deserialize(this._clientBuffer);

      if (this._clientBuffer.length >= length) {
        const packetV2 = this._clientBuffer.subarray(offset, length);
        this._clientBuffer = this._clientBuffer.subarray(length);

        const payload = packetParserForGate(messageType, packetV2);
        console.log(`[ gate - onReadClient ]payload=========> \n`, payload);

        const packetForClient = serializeForClient(messageType, sequence, payload.gamePacket);

        console.log(`[ gate - onReadClient ]payload.sessionIds =========> \n`, payload.sessionIds);
        console.log('[ GATE: ] payload.sessionIds.length ===>>> ', payload.sessionIds.length);
        if (payload.sessionIds && payload.sessionIds.length > 0) {
          payload.sessionIds.forEach((sessionId) => {
            if (this._socketMap[sessionId]) {
              console.log(
                ` FOR ====>>> ${sessionId} ====>>> `,
                this._socketMap[sessionId].socket.remoteAddress,
                ':',
                this._socketMap[sessionId].socket.remotePort,
              );
              this._socketMap[sessionId].socket.write(packetForClient);
            } else {
              console.error(` [ GATE: ] NOT FOUND SOCKET, sessionId ===>>> ${sessionId}`);
            }
          });
        } else {
          console.error(
            ` [ GATE: ] NOT FOUND SOCKET, payload.sessionIds ===>>> `,
            payload.sessionIds,
          );
        }
      }
    }
  };

  // 마이크로서비스 접속 종료 처리
  onEndClient = (options) => {
    var key = options.host + ':' + options.port;
    console.log('onEndClient', this._mapServices[key]);
  };

  // 마이크로서비스 접속 에러 처리
  onErrorClient = (options) => {
    console.log('onErrorClient');
  };

  // *
  start = async () => {
    await this.initialize();

    this.server.listen(this.context.port, () => {
      console.log(`${this.context.name} server listening on port ${this.context.port}`);

      const packet = createServerInfoNotification(
        [
          {
            name: this.context.name,
            number: 1,
            host: SERVER_HOST,
            port: this.context.port + '',
            types: this.context.types,
          },
        ],
        ++this._sequence,
      );
      console.log(`\n [ start ]  packet ==>> ${packet} \n`);

      // * Distributor와 통신 처리
      this._isConnectedDistributor = false;

      this._clientDistributor = new TcpClient(
        SERVER_HOST,
        7010,
        (options) => {
          console.log(' onCreate ==>> ');
          this._isConnectedDistributor = true;
          this._clientDistributor.write(packet);
        },
        (socket, data) => {
          this._onDistribute(socket, data);
        },
        (options) => {
          console.log(' onEnd ==>> ', options);
          this._isConnectedDistributor = false;
        },
        (options, err) => {
          console.log(' onError ==>> ', err);
          this._isConnectedDistributor = false;
        },
      );

      setInterval(() => {
        if (this._isConnectedDistributor !== true) {
          this._clientDistributor.connect();
        }
      }, 3000);

      console.log(' start () ');
    });
  };
}

export default GateServer;
