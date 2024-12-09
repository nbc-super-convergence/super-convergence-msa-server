import net from 'net';
import { TcpClient } from '@repo/common/classes';
import { getProtoMessages, loadProtos } from '@repo/common/load.protos';
import { createServerInfoNotification, packetParser, deserialize } from '@repo/common/utils';
import { config } from '@repo/common/config';

class TcpServer {
  _protoMessages;
  _sequence;
  _socketSeq = 1;
  _socketMap = {};

  constructor(name, host, port, types = []) {
    // 서버 상태 정보
    this.context = {
      port: port,
      name: name,
      host: host,
      number: 1,
      types: types,
    };
    this._sequence = 1;
    this.server = net.createServer(this._onConnection);
  }

  async initialize() {
    await loadProtos();
    this._protoMessages = getProtoMessages();
  }

  _onConnection = (socket) => {
    console.log(
      ` [ _onConnection ] ${this.context.name} server : =>  ${socket.remoteAddress} : ${socket.remotePort}`,
    );

    socket.id = ++this._socketSeq;
    this._socketMap[socket.id] = { socket };

    // this._socket = socket;
    this._onCreate(socket);

    socket.buffer = Buffer.alloc(0);

    socket.on('data', this._onData(socket));
    socket.on('end', this._onEnd(socket));
    socket.on('error', this._onError(socket));
  };

  _onCreate = (socket) => {
    console.log('[ _onCreate ] ', socket.remoteAddress, socket.remotePort);
  };

  _onData = (socket) => async (data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);
    console.log(' [ _onData ]  data ', data);
  };
  _onEnd = (socket) => () => {
    console.log(' [ _onEnd ] 클라이언트 연결이 종료되었습니다. ');
  };
  _onError = (socket) => (err) => {
    console.error(' [ _onError ]  소켓 오류가 발생하였습니다. ', err);
  };

  start = async () => {
    await this.initialize();

    this.server.listen(this.context.port, () => {
      console.log(`${this.context.name} server listening on port ${this.context.port}`);
    });
  };

  /**
   * Distributor 서버 연결
   * @param {*} host
   * @param {*} port
   * @param {*} onNoti
   */
  connectToDistributor = async (host, port, onNoti) => {
    if (!this._protoMessages) {
      await this.initialize();
    }

    const packet = createServerInfoNotification(
      [
        {
          name: this.context.name,
          number: 1,
          host: this.context.host,
          port: this.context.port + '',
          types: this.context.types,
        },
      ],
      ++this._sequence,
    );

    console.log(
      `[ connectToDistributor : [ ${this.context.name} ] ] types ==>> `,
      this.context.types,
    );

    this._isConnectedDistributor = false;

    this._clientDistributor = new TcpClient(
      host,
      port,
      (options) => {
        console.log(' onCreate ==>> ');
        this._isConnectedDistributor = true;
        this._clientDistributor.write(packet);
      },
      (socket, data) => {
        socket.buffer = Buffer.concat([socket.buffer, data]);

        while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
          // deserialized
          const { messageType, version, sequence, offset, length } = deserialize(data);

          console.log(
            `\n!! messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
          );

          // TODO: version check & sequnce check

          if (socket.buffer.length >= length) {
            const packet = socket.buffer.subarray(offset, length);
            socket.buffer = socket.buffer.subarray(length);

            const payload = packetParser(messageType, packet);

            console.log(' payload ===>>> ', payload);
          } else {
            break;
          }
        }

        // console.log(" onData tostring ==>> ", data.toString());
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
  };
}

export default TcpServer;
