import { MESSAGE_TYPE } from '../../constants/header.js';
import JoiUtils from '../../utils/joi.util.js';
import { createUser, findUserId } from '../../db/user/user.db.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../index.js';
import bcrypt from 'bcrypt';
import { redis } from '../../redis.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * 회원가입 핸들러
 * TODO : globalFailCode
 */
export const registerRequestHandler = async ({ socket, payload }) => {
  try {
    let packet = {
      success: false,
      failCode: 0,
    };

    if (payload.password !== payload.passwordConfirm) {
      // 패스워드 확인 불일치
      packet.failCode = 14;
    }

    const { loginId, password, passwordConfirm, nickname } = await JoiUtils.validateSignUp(payload);

    const checkExistId = await findUserId(loginId);
    if (checkExistId) {
      // 이미 존재하는 아이디
      packet.failCode = 15;
    }

    if (packet.failCode === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await createUser(loginId, hashedPassword, nickname);

      packet.success = true;
    }

    const payloadType = getPayloadNameByMessageType(MESSAGE_TYPE.REGISTER_RESPONSE);

    const registerResponse = serialize(MESSAGE_TYPE.REGISTER_RESPONSE, packet, payloadType);
    socket.write(registerResponse);
  } catch (error) {
    // logger.error(`[ icePlayerMoveRequestHandler ] error =>>> `, error.message, error);
    console.error(`[ registerRequestHandler ] error =>>> `, error);
  }
};

/**
 * 로그인 핸들러
 */
export const loginRequestHandler = async ({ socket, payload }) => {
  //
  try {
    const { loginId, password } = await JoiUtils.validateSignIn(payload);

    const checkExistId = await findUserId(loginId);

    let packet = {
      success: false,
      info: '',
      failCode: 0,
    };

    if (!checkExistId) {
      // 없는 아이디
      packet.failCode = 13;
    } else {
      const checkPassword = await bcrypt.compare(password, checkExistId.password);
      if (!checkPassword) {
        // 비밀번호 틀림
        packet.failCode = 13;
      }
    }

    // TODO : 중복 로그인 체크
    const checkRedundant = await redis.getUserToLogin(loginId);

    if (checkRedundant === 1) {
      // 중복 로그인 확인=> 로그인 실패 처리
      console.log('중복 로그인 확인');
      packet.failCode = 16;
    }

    // 로그인 처리
    const payloadType = getPayloadNameByMessageType(MESSAGE_TYPE.LOGIN_RESPONSE);

    if (packet.failCode === 0) {
      const sessionId = uuidv4();

      const userData = {
        id: sessionId,
        loginId: checkExistId.login_id,
        nickname: checkExistId.nickname,
        location: 'user',
      };

      packet.success = true;
      packet.info = userData;
      await redis.createUserToSession(sessionId, userData);
      await redis.createUserLogin(checkExistId.login_id);
    }

    const loginResponse = serialize(MESSAGE_TYPE.LOGIN_RESPONSE, packet, 0, payloadType);
    socket.write(loginResponse);
  } catch (error) {
    console.error(` [ loginRequestHandler ] error =>>> `, error);
  }
};
