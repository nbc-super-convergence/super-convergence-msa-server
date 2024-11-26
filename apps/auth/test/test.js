import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { loadProtos } from '@repo/common/load.protos';
import { getPayloadNameByMessageType } from '../src/handlers/index.js';

// 서버 설정
const HOST = '127.0.0.1';
const PORT = 7011;

// 비동기 함수로 실행
const runClient = async () => {
  try {
    // Protocol Buffers 파일 로드

    await loadProtos();

    // TCP 클라이언트 생성
    const client = new net.Socket();

    // 서버 연결
    client.connect(PORT, HOST, () => {
      console.log(`Connected to server at ${HOST}:${PORT}`);

      //   // 회원가입 테스트
      //   const payload = {
      //     loginId: 'test004',
      //     password: '1234qwer',
      //     passwordConfirm: '1234qwer',
      //     nickname: 'testnick004',
      //   };
      //   const buffer = serialize(1, payload, 0, 'registerRequest');
      //   client.write(buffer);
      //   console.log(`Sent Buffer`, buffer);
      // });

      // 로그인 테스트
      const payload = {
        loginId: 'haha13',
        password: '1234qwer',
      };
      const buffer = serialize(3, payload, 0, 'loginRequest');
      client.write(buffer);
      console.log(`Sent Buffer`, buffer);
    });

    // 서버로부터 데이터 수신
    client.on('data', (data) => {
      client.buffer = Buffer.alloc(0);

      handleData(data);
    });

    const handleData = (data) => {
      console.log('data', data);
      client.buffer = Buffer.concat([client.buffer, data]);
      while (client.buffer.length >= 11) {
        // deserialized
        const { messageType, version, sequence, offset, length } = deserialize(client.buffer);

        const payloadType = getPayloadNameByMessageType(messageType);

        // TODO: version check & sequnce check

        if (client.buffer.length >= length) {
          try {
            const packet = client.buffer.subarray(offset, length);
            client.buffer = client.buffer.subarray(length);

            const payload = packetParser(messageType, packet, payloadType);

            console.log('payload', payload);
          } catch (e) {
            // logger.error('[ onData ] 오류가 발생하였습니다.', e);
          }
        } else {
          break;
        }
      }
    };

    // 서버 연결 종료
    client.on('close', () => {
      console.log('Connection closed');
    });

    // 에러 처리
    client.on('error', (err) => {
      console.error(`Error: ${err.message}`);
    });

    // // 매초 패킷 전송
    // setInterval(() => {
    //   const payload = { id: Math.floor(Math.random() * 1000), message: 'Periodic Test Packet' };
    //   const buffer = Packet.encode(payload).finish();
    //   client.write(buffer);
    //   console.log(`Sent: ${JSON.stringify(payload)}`);
    // }, 1000);
  } catch (err) {
    console.error('Error setting up client:', err.message);
  }
};

// 클라이언트 실행
runClient();
