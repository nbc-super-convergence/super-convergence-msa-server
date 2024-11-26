import { TcpServer, TcpClient } from '@repo/common/classes';
import { config } from '@repo/common/config';
import {
  createServerInfoNotification,
  deserialize,
  packetParser,
  packetParserForGate,
} from '@repo/common/utils';

class GateServer extends TcpServer {
  _map = {};
  _mapServices = {};
  _mapClients = {};

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
        // * 로비 입장 시 sessionId로 socket 저장 [ LOBBY_JOIN_REQUEST: 11, ]
        if (messageType === 11) {
          //
          const packet = socket.buffer.subarray(offset, length);
          const payload = packetParser(messageType, packet);
          console.log('[ Gate - _onData ] payload ===>>> \n', payload);
          // * sessionId를 키값으로 socket 저장
          this._mapClients[payload.sessionId].socket = socket;
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
      } else {
        //
        break;
      }
    }
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
        this._socket.write(packet);
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
            host: 'localhost',
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
        '127.0.0.1',
        7010,
        (options) => {
          console.log(' onCreate ==>> ');
          this._isConnectedDistributor = true;
          this._clientDistributor.write(packet);
        },
        (socket, data) => {
          console.log(' [ _clientDistributor onData ] data tostring ==>> ', data.toString());

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
