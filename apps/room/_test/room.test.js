import net from 'net';
import { deserialize, packetParser, serialize } from '@repo/common/utils';
import { loadProtos } from '@repo/common/load.protos';
import { redis } from '../src/init/redis.js';
import { MESSAGE_TYPE } from '@repo/common/header';

class TestClient {
  constructor() {
    this.socket = new net.Socket();
    this.sessionId = 'test-session-' + (Math.random() * 3).toString();
    this.sequence = 0;
    this.userData = {
      nickname: 'TestNick' + (Math.random() * 3).toString(),
    };
    this.roomId = null;
  }

  connect(port = 7011) {
    return new Promise((resolve, reject) => {
      this.socket.connect(port, 'localhost', () => {
        console.log('게이트 서버에 연결됨');
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on('error', (error) => {
        console.error('연결 에러:', error);
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
            if (messageType === MESSAGE_TYPE.CREATE_ROOM_RESPONSE) {
              console.log('payload 타입:', payload.room);
              // * 생성된 대기방으로 roomId 설정
              this.roomId = payload.room.roomId;
            }

            console.log('\n=== 서버 응답 ===');
            console.log('메시지 타입:', messageType);
            console.log('성공 여부:', payload.success);
            console.log('데이터:', payload);
            console.log('실패 코드:', payload.failCode);
            console.log('================\n');
          } catch (e) {
            console.error('[ onData ] 오류 발생:', e);
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

  // 로비 입장
  joinLobby() {
    console.log('\n로비 입장 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.LOBBY_JOIN_REQUEST, {
      sessionId: this.sessionId,
    });
    this.socket.write(packet);
  }

  async setupTestUser() {
    try {
      // 테스트 유저 데이터 생성
      await redis.transaction.createUser(this.sessionId, this.userData.loginId, {
        loginId: this.userData.loginId,
        nickname: this.userData.nickname,
      });

      console.log('테스트 유저 설정 완료:', {
        sessionId: this.sessionId,
        userData: this.userData,
      });
      return true;
    } catch (error) {
      console.error('테스트 유저 설정 실패:', error);
      return false;
    }
  }

  async cleanup() {
    console.log('\n=== 테스트 유저 정리 ===');
    try {
      await redis.transaction.deleteUser(this.sessionId, this.userData.loginId);
      await redis.deleteUserLocation(this.sessionId);
      console.log('테스트 유저 정리 완료');
    } catch (error) {
      console.error('테스트 유저 정리 실패:', error);
    }
  }

  createPacket(messageType, payload) {
    this.sequence++;
    console.log('전송할 패킷:', { messageType, payload });
    return serialize(messageType, payload, this.sequence);
  }

  // 대기방 목록 조회
  getRoomList() {
    console.log('\n대기방 목록 조회 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.ROOM_LIST_REQUEST, {
      sessionId: this.sessionId,
    });
    this.socket.write(packet);
  }

  // 대기방 생성
  createRoom(roomName) {
    console.log('\n대기방 생성 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.CREATE_ROOM_REQUEST, {
      sessionId: this.sessionId,
      roomName: roomName,
    });
    this.socket.write(packet);
  }

  // 대기방 입장
  joinRoom(roomId) {
    console.log('\n대기방 입장 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.JOIN_ROOM_REQUEST, {
      sessionId: this.sessionId,
      roomId: roomId,
    });
    this.socket.write(packet);
  }

  // 게임 준비 상태 변경
  updateReady(isReady) {
    console.log('\n게임 준비 상태 변경 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.GAME_PREPARE_REQUEST, {
      sessionId: this.sessionId,
      isReady: isReady,
    });
    this.socket.write(packet);
  }

  // 대기방 퇴장
  leaveRoom() {
    console.log('\n대기방 퇴장 요청 전송...');
    const packet = this.createPacket(MESSAGE_TYPE.LEAVE_ROOM_REQUEST, {
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

async function runTwoUserTests() {
  const owner = new TestClient(); // 방장
  const guest = new TestClient(); // 게스트

  try {
    // 두 클라이언트 연결 및 초기 설정
    await Promise.all([owner.connect(7011), guest.connect(7011)]);

    // 테스트 유저 설정
    const [ownerSetup, guestSetup] = await Promise.all([
      owner.setupTestUser(),
      guest.setupTestUser(),
    ]);

    if (!ownerSetup || !guestSetup) {
      console.error('테스트 유저 설정 실패');
    }

    // 두 유저 로비 입장
    await new Promise((resolve) => setTimeout(resolve, 1000));
    owner.joinLobby();
    guest.joinLobby();

    // 방장이 방 생성
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // owner.createRoom('테스트방');

    // // 게스트가 방 목록 조회 후 입장
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // guest.getRoomList();

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // guest.joinRoom(owner.roomId);

    // // 게스트가 준비
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // guest.updateReady(true);

    // // 게스트가 준비 취소
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // guest.updateReady(false);

    // // 게스트가 방 퇴장
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // guest.leaveRoom();

    // // 방장이 방 퇴장
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // owner.leaveRoom();

    // // 연결 종료
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // owner.disconnect();
    // guest.disconnect();
  } catch (error) {
    console.error('테스트 실패:', error);
    owner.disconnect();
    guest.disconnect();
  } finally {
    // await Promise.all([
    //   owner.cleanup(),
    //   guest.cleanup()
    // ]);
  }
}

runTwoUserTests();
