import TcpClient from "@repo/common/classes/models/client.class.js";
import TcpServer from "@repo/common/classes/models/server.class.js";
import { config } from "@repo/common/config/config.js";
import { deserialize } from "@repo/common/utils/deserialize/deserialize.js";

class GateServer extends TcpServer {
  _mapClients = {};
  _mapMessageTypes = {
    ICE: [1, 2, 3, 4],
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
      const { messageType, version, sequence, offset, length } = deserialize(
        socket.buffer
      );
      console.log(
        `\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`
      );

      if (socket.buffer.length >= length) {
        //
        console.log(
          ` [ _onData ] while:if - messageType : ${messageType}, version : ${version}, sequence : ${sequence}, offset : ${offset}, length : ${length} `
        );

        if (this._mapMessageTypes.ICE.includes(messageType)) {
          console.log(
            ` [ _onData ] 22222 - messageType : ${messageType}, version : ${version}, sequence : ${sequence}, offset : ${offset}, length : ${length} `
          );
          /*
           * 여기서 ice server로 어떻게 넘길 것인가...
           */

          console.log("[ IFFF ] _mapClients =>>> ", this._mapClients);
        }

        const packet = socket.buffer.subarray(offset, length);
        socket.buffer = socket.buffer.subarray(length);
      } else {
        //
        break;
      }
    }
  };

  _onDistribute = (data) => {
    console.log("[ _onDistribute ] data ===>> ", data);
    for (var n in data.params) {
      const node = data.params[n];
      const key = node.host + ":" + node.port;
      if (this._mapClients[key] == null && node.name != "gate") {
        const client = new TcpClient(
          node.host,
          node.port,
          this.onCreateClient,
          this.onReadClient,
          this.onEndClient,
          this.onErrorClient
        );

        this._mapClients[key] = {
          client: client,
          info: node,
        };
        for (var m in node.urls) {
          const key = node.urls[m];
          if (this._mapMessageTypes[key] == null) {
            this._mapMessageTypes[key] = [];
          }
          this._mapMessageTypes[key].push(client);
        }
        client.connect();
      }
    }
  };

  // 마이크로서비스 접속 이벤트 처리
  onCreateClient = (options) => {
    console.log("[ onCreateClient ] options ==> ", options);
  };

  // 마이크로서비스 응답 처리
  onReadClient = (options, packet) => {
    console.log("onReadClient", packet);
  };

  // 마이크로서비스 접속 종료 처리
  onEndClient = (options) => {
    var key = options.host + ":" + options.port;
    console.log("onEndClient", this._mapClients[key]);
  };

  // 마이크로서비스 접속 에러 처리
  onErrorClient = (options) => {
    console.log("onErrorClient");
  };

  // *
  start = () => {
    this.server.listen(this.context.port, () => {
      console.log(
        `${this.context.name} server listening on port ${this.context.port}`
      );

      // * Distributor와 통신 처리
      // const packet = "hi im gate server";
      this._isConnectedDistributor = false;

      this._clientDistributor = new TcpClient(
        "127.0.0.1",
        9000,
        (options) => {
          console.log(" onCreate ==>> ");
          this._isConnectedDistributor = true;
          // this._clientDistributor.write(packet);
        },
        (options, data) => {
          console.log(
            " [ _clientDistributor onData ] data tostring ==>> ",
            data.toString()
          );

          this._onDistribute(data);
        },
        (options) => {
          console.log(" onEnd ==>> ", options);
          this._isConnectedDistributor = false;
        },
        (options, err) => {
          console.log(" onError ==>> ", err);
          this._isConnectedDistributor = false;
        }
      );

      setInterval(() => {
        if (this._isConnectedDistributor !== true) {
          this._clientDistributor.connect();
        }
      }, 3000);

      console.log(" start () ");
    });
  };
}

export default GateServer;
