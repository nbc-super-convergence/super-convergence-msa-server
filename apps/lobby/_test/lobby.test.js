import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { MESSAGE_TYPE } from '../src/utils/constants.js';
import { loadProtos } from '@repo/common/load.protos';
import { redis } from '../src/init/redis.js';

class TestClient {
  constructor() {
    this.socket = new net.Socket();
    this.sessionId = 'test-session-' + (Math.random() * 3).toString();
    this.sequence = 0;
    this.userData = {
      nickname: 'TestNick' + (Math.random() * 3).toString(),
    };
  }

  connect(port = 7011) {
    return new Promise((resolve, reject) => {
      this.socket.connect(port, 'localhost', () => {
        console.log('Connected to lobby server');
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on('error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  setupEventHandlers() {
    this.socket.buffer = Buffer.alloc(0);
    this.socket.on('data', (data) => {
      this.socket.buffer = Buffer.concat([this.socket.buffer, data]);
      while (this.socket.buffer.length >= 11) {
        const { messageType, version, sequence, offset, length } = deserialize(this.socket.buffer);

        if (this.socket.buffer.length >= length) {
          try {
            const packet = this.socket.buffer.subarray(offset, length);
            this.socket.buffer = this.socket.buffer.subarray(length);

            const payload = packetParser(messageType, packet);

            console.log('payload', payload);
            console.log('\n=== 서버 응답 ===');
            console.log('성공 여부:', payload.success);
            console.log('데이터:', payload);
            console.log('실패 코드:', payload.failCode);
            console.log('================\n');
          } catch (e) {
            console.error('[ onData ] 오류가 발생하였습니다.', e);
          }
        } else {
          break;
        }
      }
    });

    this.socket.on('close', () => {
      console.log('연결 종료됨');
    });
  }

  async setupTestUser() {
    console.log('\n=== 테스트 유저 생성 ===');
    console.log('세션 ID:', this.sessionId);
    console.log('유저 데이터:', this.userData);

    try {
      await redis.createUserToSession(this.sessionId, this.userData);

      console.log('테스트 유저 생성 완료');
      return true;
    } catch (error) {
      console.error('테스트 유저 생성 실패:', error);
      return false;
    }
  }

  async cleanup() {
    console.log('\n=== 테스트 유저 정리 ===');
    try {
      // 유저 세션 데이터 삭제
      await redis.deleteUserToSession(this.sessionId);

      // 로그인 상태 제거
      await redis.deleteUserToLogin(this.userData.loginId);

      // 위치 정보 삭제
      await redis.deleteUserLocation(this.sessionId);

      console.log('테스트 유저 정리 완료');
    } catch (error) {
      console.error('테스트 유저 정리 실패:', error);
    }
    this.disconnect();
  }

  createPacket(messageType, payload) {
    this.sequence++;
    console.log('전송할 패킷:', { messageType, payload });
    return serialize(messageType, payload, this.sequence);
  }

  // 로비 입장
  joinLobby() {
    console.log('\n로비 입장 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.LOBBY_JOIN_REQUEST, {
      sessionId: this.sessionId,
    });
    this.socket.write(packet);
  }

  // 유저 목록 조회
  getUserList() {
    console.log('\n유저 목록 조회 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.LOBBY_USER_LIST_REQUEST, {
      sessionId: this.sessionId,
    });
    this.socket.write(packet);
  }

  // 특정 유저 정보 조회
  getUserDetail(targetSessionId = this.sessionId) {
    console.log('\n유저 상세 정보 조회 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.LOBBY_USER_DETAIL_REQUEST, {
      sessionId: this.sessionId,
      targetSessionId,
    });
    this.socket.write(packet);
  }

  // 로비 퇴장
  leaveLobby() {
    console.log('\n로비 퇴장 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.LOBBY_LEAVE_REQUEST, {
      sessionId: this.sessionId,
    });
    this.socket.write(packet);
  }

  disconnect() {
    console.log('\n연결 종료 중...');
    this.socket.end();
  }
}

await loadProtos();
async function runTests() {
  const client = new TestClient();

  try {
    await client.connect(7011);

    const setupSuccess = await client.setupTestUser();
    if (!setupSuccess) {
      throw new Error('테스트 유저 설정 실패');
    }

    // 테스트 1: 로비 입장
    await new Promise((resolve) => setTimeout(resolve, 1000));
    client.joinLobby();

    // 테스트 2: 유저 목록 조회
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // client.getUserList();

    // 테스트 3: 유저 상세 정보 조회
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // client.getUserDetail();

    // 테스트 4: 로비 퇴장
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // client.leaveLobby();

    // 연결 종료는 마지막 테스트 후 적당한 시간 뒤에 실행
    await new Promise((resolve) => setTimeout(resolve, 2000));
    client.disconnect();
  } catch (error) {
    console.error('테스트 실패:', error);
    client.disconnect();
  } finally {
    // await client.cleanup();
  }
}

runTests();
