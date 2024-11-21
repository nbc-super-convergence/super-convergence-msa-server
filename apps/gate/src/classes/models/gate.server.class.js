import { TcpServer, TcpClient } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { createServerInfoNotification, deserialize, packetParser } from '@repo/common/utils';

class GateServer extends TcpServer {
  _map = {};
  _mapClients = {};
  _mapMessageTypes = {
    ICE: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };
  _isConnectedDistributor;

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
        // TODO: _map 뒤져서 찾기
        for (const [key, value] of Object.entries(this._map)) {
          if (value.types.includes(messageType)) {
            // * messageType에 맞는 Client
            const targetService = this._mapClients[key];
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

          this._mapClients[key] = {
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
  onReadClient = (options, packet) => {
    console.log('onReadClient', packet);
    this._socket.write(packet);
  };

  // 마이크로서비스 접속 종료 처리
  onEndClient = (options) => {
    var key = options.host + ':' + options.port;
    console.log('onEndClient', this._mapClients[key]);
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
        9000,
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
