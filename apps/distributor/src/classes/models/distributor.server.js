import { TcpServer } from '@repo/common/classes';
import { config } from '@repo/common/config';
import { createServerInfoNotification, deserialize, packetParser } from '@repo/common/utils';
import { SERVER_HOST } from '../../constants/env.js';

class DistributorServer extends TcpServer {
  //
  _map = {};

  constructor() {
    super('distributor', SERVER_HOST, 7010, []);
  }

  _onCreate = (socket) => {
    console.log('[ _onCreate ] ', socket.remoteAddress, socket.remotePort);
    this.sendInfo(socket);
  };

  _onData = (socket) => async (data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(socket.buffer);
      console.log(
        `\n@@ messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
      );

      if (socket.buffer.length >= length) {
        //
        const packet = socket.buffer.subarray(offset, length);
        socket.buffer = socket.buffer.subarray(length);

        const payload = packetParser(messageType, packet);
        console.log(' [ distributor _onData ] payload ====>> ', payload);

        for (let i = 0; i < payload.params.length; i++) {
          const param = payload.params[i];

          const key = param.name + '_' + param.number;
          // 서버정보 매핑
          // socket.remoteAddress, socket.remotePort
          this._map[key] = {
            socket: socket,
            name: param.name,
            number: param.number,
            host: param.host,
            port: param.port,
            types: param.types,
          };

          this.sendInfo();
        }
      } else {
        //
        break;
      }
    }

    //
  };

  /**
   * Distributor Server 는 Server 끼리만 연결
   */

  _onEnd = (socket) => () => {
    const shutdownServer = Object.values(this._map).find((server) => server.socket === socket);
    console.log('[ _onEnd ] shutdownServer ===>>> ', shutdownServer);
    if (shutdownServer) {
      const key = shutdownServer.name + '_' + shutdownServer.number;
      delete this._map[key];
      console.log(`${shutdownServer.name} 서버가 종료되었습니다. `);
      this.sendInfo();
    }
  };

  _onError = (socket) => (err) => {
    if (err.code === 'ECONNRESET') {
      this._onEnd(socket)();
      return;
    }
    console.error(' [ _onError ]  소켓 오류가 발생하였습니다. ', err);
  };

  sendInfo(socket) {
    const params = [
      {
        name: this.context.name,
        number: 1,
        host: SERVER_HOST,
        port: this.context.port + '',
        types: this.context.types,
      },
    ];

    for (let n in this._map) {
      const map = this._map[n];

      params.push({
        name: map.name,
        number: map.number,
        host: map.host,
        port: map.port,
        types: map.types,
      });
    }

    console.log('[ distributor sendInfo ] params ===>>> ', params);

    const packet = createServerInfoNotification(params, ++this._sequence);

    if (socket) {
      this.write(socket, packet);
    } else {
      for (let n in this._map) {
        this.write(this._map[n].socket, packet);
      }
    }
  }

  write(socket, packet) {
    socket.write(packet);
  }
}

export default DistributorServer;
