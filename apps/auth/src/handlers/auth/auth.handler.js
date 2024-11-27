import { MESSAGE_TYPE } from '../../constants/header.js';
import JoiUtils from '../../utils/joi.util.js';
import { createUser, findUserId } from '../../db/user/user.db.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../index.js';
import bcrypt from 'bcrypt';
import { redis } from '../../redis.js';
import { v4 as uuidv4 } from 'uuid';
import { FAIL_CODE } from '@repo/common/failcodes';

/**
 * 회원가입 핸들러
 */
export const registerRequestHandler = async ({ socket, payload }) => {
  try {
    let packet = {
      success: false,
      failCode: FAIL_CODE.NONE_FAILCODE,
    };

    if (payload.password !== payload.passwordConfirm) {
      packet.failCode = FAIL_CODE.ID_OR_PASSWORD_MISS;
    }

    const { loginId, password, passwordConfirm, nickname } = await JoiUtils.validateSignUp(payload);

    const checkExistId = await findUserId(loginId);
    if (checkExistId) {
      packet.failCode = FAIL_CODE.ID_OR_PASSWORD_MISS;
    }

    if (packet.failCode === FAIL_CODE.NONE_FAILCODE) {
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
  try {
    const { loginId, password } = await JoiUtils.validateSignIn(payload);

    const checkExistId = await findUserId(loginId);

    let packet = {
      success: false,
      sessionId: '',
      failCode: FAIL_CODE.NONE_FAILCODE,
    };

    if (!checkExistId) {
      packet.failCode = FAIL_CODE.ID_OR_PASSWORD_MISS;
    } else {
      const checkPassword = await bcrypt.compare(password, checkExistId.password);
      if (!checkPassword) {
        packet.failCode = FAIL_CODE.ID_OR_PASSWORD_MISS;
      }
    }

    // 중복 로그인 CHECK
    const checkRedundant = await redis.getUserToLogin(loginId);

    if (checkRedundant === 1) {
      packet.failCode = FAIL_CODE.ALREADY_LOGGED_IN_ID;
    }

    // 로그인 처리
    if (packet.failCode === FAIL_CODE.NONE_FAILCODE) {
      const sessionId = uuidv4();

      const redisData = {
        loginId: checkExistId.login_id,
        nickname: checkExistId.nickname,
        location: '',
      };

      packet.success = true;
      packet.sessionId = sessionId;
      await redis.createUserToSession(sessionId, redisData);
      await redis.createUserLogin(checkExistId.login_id);
    }

    const payloadType = getPayloadNameByMessageType(MESSAGE_TYPE.LOGIN_RESPONSE);
    const loginResponse = serialize(MESSAGE_TYPE.LOGIN_RESPONSE, packet, 0, payloadType);
    socket.write(loginResponse);
  } catch (error) {
    console.error(` [ loginRequestHandler ] error =>>> `, error);
  }
};
