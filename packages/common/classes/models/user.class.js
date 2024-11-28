class User {
  constructor(id, gameId, sessionId) {
    this.id = id;

    // TODO: 테스트용 게임 세션 ID로 진행
    this.gameId = gameId; // Game Session ID
    this.sessionId = sessionId;
    this.player; // Player
  }

  getGameId() {
    return this.gameId;
  }

  setPlayer() {}
}

export default User;
