export const dropGameReadyRequestHandler = async ({ socket, payload }) => {
  const { sessionId } = payload;
};

export const dropPlayerSyncRequestHandler = async ({ socket, payload }) => {
  const { sessionId, slot, rotation, state } = payload;

  // ! 1. 유저, 게임 검증
  // ! 2. 유저가 사망했는지 검증
  // ! 3. slot에 다른 유저 있는지 검증
};
