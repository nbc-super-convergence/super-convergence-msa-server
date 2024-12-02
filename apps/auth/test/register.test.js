import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { loadProtos } from '@repo/common/load.protos';
import { getPayloadNameByMessageType } from '@repo/common/handlers';
import { config } from '@repo/common/config';

// 테스트 코드를 작성해 주세요.
const LOGIN_ID = 'testReg001';
const PASSWORD = '1234qwer';
const PASSWORD_CONFIRM = '1234qwer';
const NICKNAME = 'testName01';

// 대상 - GATE SERVER
const HOST = '127.0.0.1';
const PORT = 7011;

/**
 * 회원가입 요청 TEST CODE
 */
const runClient = async () => {
  try {
    // Protocol Buffers 파일 로드

    await loadProtos();

    const client = new net.Socket();

    client.connect(PORT, HOST, () => {
      console.log(`Connected to server at ${HOST}:${PORT}`);

      // TEST 1 유효성 에러
      setTimeout(() => {
        console.log(`유효성 에러 ===>>> FailCode:${config.FAIL_CODE.VALIDAION_ERROR}`);

        const payload1 = {
          loginId: LOGIN_ID,
          password: 'ab',
          passwordConfirm: PASSWORD_CONFIRM,
          nickname: NICKNAME,
        };

        const buffer1 = serialize(1, payload1, 0, 'registerRequest');
        client.write(buffer1);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 100);

      // TEST 2 비밀번호 확인 불일치
      setTimeout(() => {
        console.log(
          `비밀번호 확인 불일치 ===>>> FailCode:${config.FAIL_CODE.NOT_MATCH_PASSWORD_CONFIRM}`,
        );

        const payload2 = {
          loginId: LOGIN_ID,
          password: PASSWORD,
          passwordConfirm: PASSWORD_CONFIRM + 1,
          nickname: NICKNAME,
        };

        const buffer2 = serialize(1, payload2, 0, 'registerRequest');
        client.write(buffer2);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 400);

      // TEST 3 이미 사용중인 ID
      setTimeout(() => {
        console.log(`이미 사용중인 아이디 ===>>> FailCode:${config.FAIL_CODE.ALREADY_EXIST_ID}`);

        const payload3 = {
          loginId: 'hahahaho',
          password: PASSWORD,
          passwordConfirm: PASSWORD_CONFIRM,
          nickname: NICKNAME,
        };

        const buffer3 = serialize(1, payload3, 0, 'registerRequest');
        client.write(buffer3);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 800);

      // TEST 4 이미 사용중인 NICKNAME
      setTimeout(() => {
        console.log(
          `이미 사용중인 닉네임 ===>>> FailCode:${config.FAIL_CODE.ALREADY_EXIST_NICKNAME}`,
        );

        const payload4 = {
          loginId: LOGIN_ID,
          password: PASSWORD,
          passwordConfirm: PASSWORD_CONFIRM,
          nickname: 'test111',
        };

        const buffer4 = serialize(1, payload4, 0, 'registerRequest');
        client.write(buffer4);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 1200);

      // TEST 5 회원가입 성공
      setTimeout(() => {
        console.log(`회원가입 성공 ===>>> FailCode:${config.FAIL_CODE.NONE_FAILCODE}`);

        const payload5 = {
          loginId: LOGIN_ID,
          password: PASSWORD,
          passwordConfirm: PASSWORD_CONFIRM,
          nickname: NICKNAME,
        };

        const buffer5 = serialize(1, payload5, 0, 'registerRequest');
        client.write(buffer5);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 1600);

      // TEST 6 회원가입 동시 시도
      setTimeout(() => {
        console.log(`회원가입 동시 시도 ===>>> FailCode:${config.FAIL_CODE.NONE_FAILCODE}`);

        const payload5 = {
          loginId: LOGIN_ID,
          password: PASSWORD,
          passwordConfirm: PASSWORD_CONFIRM,
          nickname: NICKNAME,
        };

        const buffer5 = serialize(1, payload5, 0, 'registerRequest');
        client.write(buffer5);
        // console.log(`C2S buffer ===>>> `, buffer);
      }, 1600);
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
