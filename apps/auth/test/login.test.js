import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { loadProtos } from '@repo/common/load.protos';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { config } from '@repo/common/config';

// 테스트 코드를 작성해 주세요.
const LOGIN_ID = 'test003';
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

      // TEST 1 유효성 에러
      setTimeout(() => {
        console.log(`유효성 에러 ===>>> FailCode:${config.FAIL_CODE.VALIDAION_ERROR}`);
        const payload1 = {
          loginId: LOGIN_ID,
          password: 'abc',
        };
        const buffer1 = serialize(3, payload1, 0, 'loginRequest');
        client.write(buffer1);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 100);

      // TEST 2 비밀번호or 아이디 틀림
      setTimeout(() => {
        console.log(`잘못된 비밀번호 ===>>> FailCode:${config.FAIL_CODE.ID_OR_PASSWORD_MISS}`);

        const payload2 = {
          loginId: LOGIN_ID,
          password: '12345678',
        };
        const buffer2 = serialize(3, payload2, 0, 'loginRequest');
        client.write(buffer2);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 500);

      // TEST 3 로그인 성공
      setTimeout(() => {
        console.log(`로그인 성공 ===>>> FailCode:${config.FAIL_CODE.NONE_FAILCODE}`);

        const payload3 = {
          loginId: LOGIN_ID,
          password: PASSWORD,
        };
        const buffer3 = serialize(3, payload3, 0, 'loginRequest');
        client.write(buffer3);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 1000);

      // TEST 4 중복 로그인
      setTimeout(() => {
        console.log(`중복 로그인 ===>>> FailCode:${config.FAIL_CODE.ALREADY_LOGGED_IN_ID}`);

        const payload4 = {
          loginId: LOGIN_ID,
          password: PASSWORD,
        };
        const buffer4 = serialize(3, payload4, 0, 'loginRequest');
        client.write(buffer4);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 1500);
    });

    // 서버로부터 데이터 수신
    client.on('data', (data) => {
      client.buffer = Buffer.alloc(0);

      handleData(data);
    });

    const handleData = (data) => {
      // console.log('S2C buffer ===>>> ', data);
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
