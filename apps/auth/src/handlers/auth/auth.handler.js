import { MESSAGE_TYPE } from '../../constants/header.js';
import JoiUtils from '../../utils/joi.util.js';
import bcrypt from 'bcrypt';
import { createUser, findUserId } from '../../db/user/user.db.js';
import { serialize } from '@repo/common/utils';

/**
 * 테스트 게임용 준비 완료 요청
 * @param {*} param
 */
export const registerRequestHandler = async ({ socket, payload }) => {
  try {
    if (payload.password !== payload.passwordConfirm) {
      const responsePayload = {
        success: false,
        message: '비밀번호 확인이 일치하지 않습니다. ',
        failCode: 2,
      };

      const registerResponse = serialize(MESSAGE_TYPE.REGISTER_RESPONSE, responsePayload);
      socket.write(registerResponse);

      return;
    }
    const { loginId, password, passwordConfirm, nickName } = await JoiUtils.validateSignUp(payload);

    const checkExistId = await findUserId(id);
    if (checkExistId) {
      const responsePayload = {
        success: false,
        message: '이미 존재하는 ID',
        failCode: 2,
      };

      const registerResponse = serialize(MESSAGE_TYPE.REGISTER_RESPONSE, responsePayload);
      socket.write(registerResponse);

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUserId = await createUser(loginId, hashedPassword, nickName);

    const responsePayload = {
      success: true,
      message: 'Register Success',
      failCode: 0,
    };

    const registerResponse = serialize(MESSAGE_TYPE.REGISTER_RESPONSE, responsePayload);
    socket.write(registerResponse);
  } catch (error) {
    // logger.error(`[ icePlayerMoveRequestHandler ] error =>>> `, error.message, error);
    console.error(`[ icePlayerMoveRequestHandler ] error =>>> `, error);
  }
};
