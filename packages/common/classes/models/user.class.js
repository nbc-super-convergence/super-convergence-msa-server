// ! 추상 클래스
class User {
  constructor(gameId, sessionId) {
    // TODO: 테스트용 게임 세션 ID로 진행
    this.gameId = gameId; // Game Session ID
    this.sessionId = sessionId;
  }

  getGameId() {
    return this.gameId;
  }

  setPlayer() {}
}

export default User;
