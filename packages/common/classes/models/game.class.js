// ! 추상 클래스
class Game {
  constructor(id) {
    this.id = id;
    this.state = 'Wait';

    this.users = [];
  }

  // TODO: 기능 추가
  addUser() {}

  getUser() {}

  getAllUsers() {}

  updateMapSync() {}
}

export default Game;
