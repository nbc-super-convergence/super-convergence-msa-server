import { serializeForGate } from '@repo/common/utils';
import { redis } from '../../redis.js';
import { MESSAGE_TYPE } from '../../constants/header.js';

/**
 *  로그아웃 핸들러
 *  minigame 제외
 */

export const logoutHandler = async ({ socket, payload }) => {
  try {
    //
    const { sessionId } = payload;
    let notificationTarget = [];
    const nickname = await redis.getUserToSessionfield(sessionId, 'nickname');
    const userLocation = await redis.getUserLocation(sessionId);

    // 로비의 세션  [ lobby_room_list, lobby_users ]
    if (userLocation['lobby']) {
      //같은 로비에 있던 다른 유저
      //??

      //종료한 유저 로비에서 제거
      await redis.transaction.leaveLobby(sessionId, userLocation['lobby'], nickname);
      await redis.deleteUserLocationField(sessionId, 'lobby');
    }

    // room 의 세션 [ room ]
    if (userLocation['room']) {
      const room = await redis.getRoom(userLocation['room']);
      const roomUsers = JSON.parse(room.users);
      const readyUsers = JSON.parse(room.readyUsers);

      //같은 룸에 있던 다른 유저들
      const otherRoomUsers = roomUsers.filter((user) => user !== sessionId);
      const otherReadyUsers = readyUsers.filter((user) => user !== sessionId);

      //종료한 유저 룸에서 제거
      if (roomUsers.includes(sessionId)) {
        await redis.updateRoomField(userLocation['room'], 'users', JSON.stringify(otherRoomUsers));
      }

      // 종료한 유저가 Ready 상태인 경우 제거
      if (readyUsers.includes(sessionId)) {
        await redis.updateRoomField(
          userLocation['room'],
          'readyUsers',
          JSON.stringify(otherReadyUsers),
        );
      }

      // 종료한 유저가 방장인 경우 교체
      if (room.ownerId === sessionId) {
        await redis.updateRoomField(userLocation['room'], 'ownerId', roomUsers[0]);
      }

      //빈 방이 된 경우
      if (otherRoomUsers.length < 1) {
        await redis.deleteRoom(userLocation['room']);
      } else {
        if (room.ownerId === sessionId) {
          await redis.updateRoomField(userLocation['room'], 'ownerId', otherRoomUsers[0]);
        }

        if (room.readyUsers.includes(sessionId)) {
          await redis.updateRoomField(
            userLocation['room'],
            'readyUsers',
            JSON.stringify(otherRoomUsers),
          );
        }
      }
      await redis.deleteUserLocationField(sessionId, 'room');
      notificationTarget = otherRoomUsers;
    }

    // 보드의 세션 [ board, board_players, board_player_info]
    if (userLocation['board']) {
      const boardUsers = await redis.getBoardPlayers(userLocation['board']);
      const otherUsers = boardUsers.filter((user) => user !== sessionId);
      //  .filter((user) => user.sessionId !== sessionId);

      // 종료한 유저 보드에서 제거
      await redis.deleteBoardPlayerInfo(userLocation['board'], sessionId);
      await redis.deleteBoardPlayers(userLocation['board'], sessionId);

      // 종료한 유저가 보드의 방장이었던 경우
      const boardOwner = await redis.getBoardGameField(userLocation['board'], 'ownerId');
      if (boardOwner === sessionId) {
        await redis.updateBoardGameField(userLocation['board'], 'ownerId', otherUsers[0]);
      }

      // 남은 유저가 없을 경우
      if (otherUsers.length === 0) {
        await redis.deleteBoardGame(userLocation['board']);
      }
      await redis.deleteUserLocationField(sessionId, 'board');

      notificationTarget = otherUsers;
    }

    if (notificationTarget.length > 0) {
      const packet = {
        sessionId: sessionId,
      };
      const closeSocketNotification = serializeForGate(
        MESSAGE_TYPE.CLOSE_SOCKET_NOTIFICATION,
        packet,
        0,
        notificationTarget,
      );
      socket.write(closeSocketNotification);
    }
  } catch (error) {
    console.error(`[ logoutHandler ] error =>>> `, error);
  }
};
