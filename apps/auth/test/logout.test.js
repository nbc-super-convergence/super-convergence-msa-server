import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { loadProtos } from '@repo/common/load.protos';

// 테스트 코드를 작성해 주세요.
const SESSION_ID = '2e2e337f-0f66-474d-b403-c939adf6f85d';

// 대상 - GATE SERVER
const HOST = '127.0.0.1';
const PORT = 7011;

/**
 *  로그아웃 요청 TEST CODE (임시)
 *  response 돌려받지 않음
 */
const runClient = async () => {
  try {
    // Protocol Buffers 파일 로드

    await loadProtos();

    const client = new net.Socket();

    client.connect(PORT, HOST, () => {
      console.log(`Connected to server at ${HOST}:${PORT}`);

      // 로그아웃 요청 payload
      const payload = {
        sessionId: SESSION_ID,
      };
      const buffer = serialize(5, payload, 0, 'logoutRequest');
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

        const payloadType = 'closeSocketNotification';

        if (client.buffer.length >= length) {
          try {
            const packet = client.buffer.subarray(offset, length);
            client.buffer = client.buffer.subarray(length);

            const payload = packetParser(messageType, packet, payloadType);
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
