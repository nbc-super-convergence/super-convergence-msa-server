import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { loadProtos } from '@repo/common/load.protos';
import { getPayloadNameByMessageType } from '@repo/common/handlers';

// 테스트 코드를 작성해 주세요.
const LOGIN_ID = 'loginTest001';
const PASSWORD = '1234qwer';

// 대상 - GATE SERVER
const HOST = '127.0.0.1';
const PORT = 7011;

/**
 *  로그인 요청 TEST CODE (임시)
 */
const runClient = async () => {
  try {
    // Protocol Buffers 파일 로드import { getPayloadNameByMessageType } from '@repo/common/handlers';

    await loadProtos();

    const client = new net.Socket();

    client.connect(PORT, HOST, () => {
      console.log(`Connected to server at ${HOST}:${PORT}`);

      // 로그인 요청 payload
      const payload = {
        loginId: LOGIN_ID,
        password: PASSWORD,
      };
      const buffer = serialize(3, payload, 0, 'loginRequest');
      client.write(buffer);
      console.log(`C2S buffer ===>>> `, buffer);
    });

    // 서버로부터 데이터 수신
    client.on('data', (data) => {
      client.buffer = Buffer.alloc(0);

      handleData(data);
    });

    const handleData = (data) => {
      console.log('S2C buffer ===>>> ', data);
      client.buffer = Buffer.concat([client.buffer, data]);
      while (client.buffer.length >= 11) {
        // deserialized
        const { messageType, version, sequence, offset, length } = deserialize(client.buffer);

        const payloadType = getPayloadNameByMessageType(messageType);

        if (client.buffer.length >= length) {
          try {
            const packet = client.buffer.subarray(offset, length);
            client.buffer = client.buffer.subarray(length);

            const payload = packetParser(messageType, packet, payloadType);

            console.log('payload', payload);
          } catch (e) {
            console.error('[ onData ] 오류가 발생하였습니다.', e);
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
  } catch (err) {
    console.error('Error setting up client:', err.message);
  }
};

// 클라이언트 실행
runClient();
