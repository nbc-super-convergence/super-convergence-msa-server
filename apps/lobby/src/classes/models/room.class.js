class Room {
  constructor(id, ownerId, name) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.state = 'WAIT';
    this.users = new Map();
    this.maxUsers = 4; // TODO: 생성 때 변경가능해지면 수정
    this.readyUsers = new Set();
  }

  // 유저의 대기방 참가
  joinUser(userData) {
    if (this.users.has(userData.userId)) {
      console.error(`이미 접속해 있는 유저입니다.`);
    }
    console.log(`${userData.userId} 유저가 대기방에 접속했습니다.`);
    this.users.set(userData.userId, userData);
  }

  // 유저의 대기방 이탈
  leaveUser(userId) {
    this.users.delete(userId);
    this.readyUsers.delete(userId);
    console.log(`${userId} 유저가 대기방에서 나갔습니다.`);
  }

  // 유저의 레디
  setReady(userId) {
    this.readyUsers.add(userId);
    console.log(`${userId} 유저가 준비했습니다.`);
  }

  // 유저의 레디 취소
  cancelReady(userId) {
    this.readyUsers.delete(userId);
    console.log(`${userId} 유저가 준비를 취소했습니다.`);
  }

  // 대기방 데이터 조회
  getRoomData() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      state: this.state,
      users: Array.from(this.users.values()),
      maxUsers: this.maxUsers,
      readyUsers: Array.from(this.readyUsers.value()),
    };
  }

  // 유저가 없으면
  isEmpty() {
    return this.users.size === 0;
  }
}

export default Room;
