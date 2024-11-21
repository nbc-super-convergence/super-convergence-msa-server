import TcpServer from "@repo/common/classes/models/server.class.js";
import { config } from "@repo/common/config/config.js";
import { deserialize } from "@repo/common/utils/deserialize/deserialize.js";
import { createServerInfoNotification } from "@repo/common/utils/notifications/distributor.notification.js";

class DistributorServer extends TcpServer {
  //
  _map = {};

  constructor() {
    super("distributor", 9000, []);
  }

  _onCreate = (socket) => {
    console.log("[ _onCreate ] ", socket.remoteAddress, socket.remotePort);
    this.sendInfo(socket);
  };

  _onData = (socket) => async (data) => {
    socket.buffer = Buffer.concat([socket.buffer, data]);

    while (socket.buffer.length >= config.PACKET.TOTAL_LENGTH) {
      //
      const { messageType, version, sequence, offset, length } = deserialize(
        socket.buffer
      );
      console.log(
        `\n@@ messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`
      );

      if (socket.buffer.length >= length) {
        //
        console.log(
          ` [ _onData ] while:if - messageType : ${messageType}, version : ${version}, sequence : ${sequence}, offset : ${offset}, length : ${length} `
        );

        // TODO: this._mapMessageTypes 없애고, _map에 값 넣어서 그걸로 수정할 것!!!
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

        console.log(" packet ====>> ", packet);
      } else {
        //
        break;
      }
    }

    //
  };

  sendInfo(socket) {
    // const packet = {
    //   uri: "/distributes",
    //   method: "GET",
    //   key: 0,
    //   params: [],
    // };

    const params = [
      {
        name: this.context.name,
        number: 1,
        host: "localhost",
        port: this.context.port + "",
        types: this.context.types,
      },
    ];

    for (let n in this._map) {
      console.log(" for - n ===>>> ", n);

      // packet.params.push(this._map[n].info);
      // params.push({
      //   name: this._map[n].info.name,
      //   number: 1,
      //   host: "localhost",
      //   port: this._map[n].info.port + "",
      //   types: this.context.types,
      // });
    }

    const packet = createServerInfoNotification(params, ++this._sequence);

    console.log("[ sendInfo ] packet ===>>> ", packet);
    if (socket) {
      console.log("iffff ===");
      this.write(socket, packet);
    } else {
      console.log("elsss ===> ", this._map);
      for (let n in this._map) {
        this.write(this._map[n].socket, packet);
      }
    }
  }

  write(socket, packet) {
    socket.write(JSON.stringify(packet) + "¶");
  }
}

export default DistributorServer;
