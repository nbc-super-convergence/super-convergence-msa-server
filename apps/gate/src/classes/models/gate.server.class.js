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
import { SERVER_HOST, DISTRIBUTOR_HOST } from '../../constants/env.js';
import { makeCloseSocketRequest } from '../../utils/request/message.utils.js';
import { logger } from '../../utils/logger.utils.js';

class GateServer extends TcpServer {
  _map = {};
  _mapServices = {};

  _isConnectedDistributor;
  _clientBuffer = Buffer.alloc(0);

  constructor(name, port) {
    super(name, SERVER_HOST, port, []);
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
      logger.info(
        `[ GATE :_onData ]\n messageType : ${messageType}, \n version : ${version}, \n sequence : ${sequence}, \n offset : ${offset}, \n length : ${length}`,
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

          logger.info('[ GATE : _onData ]  socket.id ====>>> ', socket.id);

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
            logger.info('[ GATE - _onData ] payload ===>>> \n', payload);

            // * 저장되어있는 소켓값 삭제
            try {
              logger.info(' [ GATE: _onData ] KEYS ===>>> ', Object.keys(this._socketMap));
              const mapKey = Object.keys(this._socketMap).find(
                (key) => String(key).length < 5 && this._socketMap[key].socket === socket,
              );
              if (mapKey) {
                // TODO: 테스트 후, 주석 풀기
                // TODO: 여기서는 mapKey를 별도로 저장하고 커넥션을 끊을때 지우기
                // delete this._socketMap[mapKey];
              }
            } catch (err) {
              logger.error('[ GATE: _onData ] 임시 소켓 삭제 시도 실패, ERR ==>> ', err);
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
    const sessionId = Object.keys(this._socketMap).find(
      (key) => String(key).length > 3 && this._socketMap[key].socket === socket,
    );
    logger.info(' [ GATE: _onEnd ] 클라이언트 연결이 종료되었습니다. ==>> ', sessionId);

    this._closeSocketSend(sessionId);
  };
  _onError = (socket) => (err) => {
    const sessionId = Object.keys(this._socketMap).find(
      (key) => String(key).length > 3 && this._socketMap[key].socket === socket,
    );
    logger.error(` [ GATE: _onError ]  소켓 오류가 발생하였습니다.:  ${sessionId} `, err);

    // * 로그아웃 처리
    this._closeSocketSend(sessionId);
  };

  /**
   * * 종료 이벤트시 , 각 서비스서버에 전송
   * @param {String} sessionId
   */
  _closeSocketSend = (sessionId) => {
    logger.info('\n [ GATE: _closeSocketSend ]  [ keys ] ', Object.keys(this._mapServices));

    const closeSocketPacket = makeCloseSocketRequest(sessionId);
    // * 인증, 아이스, 그 외 미니게임들 추가 예정
    // * 인증(auth)은 언제나 마지막에 있어야 한다.
    const serviceList = ['ice', 'bomb', 'dropper', 'auth', 'dance'];
    for (let i = 0; i < serviceList.length; i++) {
      const targetService = this._mapServices[serviceList[i] + '_1'];
      if (targetService && targetService.client) {
        // TODO: 다른 서버 준비되면 주석 풀기
        targetService.client.write(closeSocketPacket);
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
            logger.info('[ GATE: connect Service Server ] param ====>>> ', param);
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
    logger.info('[ onCreateClient ] options ==> ', options);
  };

  // 마이크로서비스 응답 처리
  // * 서비스 서버에게 받은 데이터
  onReadClient = (options, packet) => {
    logger.info('[ gate - onReadClient ] =========> \n', packet);
    this._clientBuffer = Buffer.concat([this._clientBuffer, packet]);

    while (this._clientBuffer.length >= config.PACKET.TOTAL_LENGTH) {
      const { messageType, version, sequence, offset, length } = deserialize(this._clientBuffer);

      if (this._clientBuffer.length >= length) {
        const packetV2 = this._clientBuffer.subarray(offset, length);
        this._clientBuffer = this._clientBuffer.subarray(length);

        const payload = packetParserForGate(messageType, packetV2);
        logger.info(`[ gate - onReadClient ]payload=========> \n`, payload);

        const packetForClient = serializeForClient(messageType, sequence, payload.gamePacket);

        logger.info(`[ gate - onReadClient ]payload.sessionIds =========> \n`, payload.sessionIds);
        logger.info('[ GATE: ] payload.sessionIds.length ===>>> ', payload.sessionIds.length);
        if (payload.sessionIds && payload.sessionIds.length > 0) {
          payload.sessionIds.forEach((sessionId) => {
            if (this._socketMap[sessionId]) {
              logger.info(
                ` FOR ====>>> ${sessionId} ====>>> `,
                this._socketMap[sessionId].socket.remoteAddress,
                ':',
                this._socketMap[sessionId].socket.remotePort,
              );
              this._socketMap[sessionId].socket.write(packetForClient);
            } else {
              logger.error(` [ GATE: ] NOT FOUND SOCKET, sessionId ===>>> ${sessionId}`);
            }
          });
        } else {
          logger.error(
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
    logger.info('onEndClient', this._mapServices[key]);
  };

  // 마이크로서비스 접속 에러 처리
  onErrorClient = (options) => {
    logger.info('onErrorClient');
  };

  // *
  start = async () => {
    await this.initialize();

    this.server.listen(this.context.port, '0.0.0.0', () => {
      logger.info(`${this.context.name} server listening on port ${this.context.port}`);

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
      logger.info(`\n [ start ]  packet ==>> ${packet} \n`);

      // * Distributor와 통신 처리
      this._isConnectedDistributor = false;

      this._clientDistributor = new TcpClient(
        DISTRIBUTOR_HOST, //SERVER_HOST,
        7010,
        (options) => {
          logger.info(' onCreate ==>> ');
          this._isConnectedDistributor = true;
          this._clientDistributor.write(packet);
        },
        (socket, data) => {
          this._onDistribute(socket, data);
        },
        (options) => {
          logger.info(' onEnd ==>> ', options);
          this._isConnectedDistributor = false;
        },
        (options, err) => {
          logger.info(' onError ==>> ', err);
          this._isConnectedDistributor = false;
        },
      );

      setInterval(() => {
        if (this._isConnectedDistributor !== true) {
          this._clientDistributor.connect();
        }
      }, 3000);

      logger.info(' start () ');
    });
  };
}

export default GateServer;
