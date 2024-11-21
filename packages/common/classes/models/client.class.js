import net from "net";

class TcpClient {
  constructor(host, port, onCreate, onData, onEnd, onError) {
    this.options = {
      host: host,
      port: port,
    };
    this._onCreate = onCreate;
    this._onData = onData;
    this._onEnd = onEnd;
    this._onError = onError;
  }

  connect = () => {
    this._socket = net.connect(this.options, () => {
      console.log(
        `Client connected to ${this.options.host} : ${this.options.port}`
      );
      if (this._onCreate) this._onCreate(this.options);
      this._socket.buffer = Buffer.alloc(0);
    });
    this._socket.on("data", (data) => {
      if (this._onData) this._onData(this._socket, data);
    });

    // 접속 종료 처리
    this._socket.on("close", () => {
      if (this._onEnd) this._onEnd(this.options);
    });

    // 에러 처리
    this._socket.on("error", (err) => {
      if (this._onError) this._onError(this.options, err);
    });
  };

  /**
   * * 발송
   * @param {*} packet
   */
  write = (packet) => {
    this._socket.write(packet);
  };
}

export default TcpClient;
