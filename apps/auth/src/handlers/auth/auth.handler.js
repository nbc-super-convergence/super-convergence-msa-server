import { MESSAGE_TYPE } from '../../constants/header.js';
import { createUser, findUserId } from '../../db/user/user.db.js';
import { serializeForGate } from '@repo/common/utils';
import { redis } from '../../redis.js';
import { v4 as uuidv4 } from 'uuid';
import { loginValidation, registerValidation } from '../../utils/auth.utils.js';
import { config } from '@repo/common/config';
import bcrypt from 'bcrypt';

/**
 * 회원가입 핸들러
 */
export const registerRequestHandler = async ({ socket, payload }) => {
  const { loginId, password, passwordConfirm, nickname } = payload;
  const registerPayload = { loginId, password, passwordConfirm, nickname };

  const checkExistId = await findUserId(loginId);
  const resultFailcode = await registerValidation(registerPayload, checkExistId);

  try {
    let packet = {
      success: false,
      failCode: resultFailcode,
    };

    // 회원가입 처리
    if (packet.failCode === config.FAIL_CODE.NONE_FAILCODE) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await createUser(loginId, hashedPassword, nickname);
      packet.success = true;
    }

    const registerResponse = serializeForGate(MESSAGE_TYPE.REGISTER_RESPONSE, packet, 0, [
      payload.sequence,
    ]);
    socket.write(registerResponse);
  } catch (error) {
    console.error(`[ registerRequestHandler ] error =>>> `, error);
  } finally {
    await redis.deleteLockKey('register', loginId);
  }
};

/**
 * 로그인 핸들러
 */
export const loginRequestHandler = async ({ socket, payload }) => {
  try {
    const { loginId, password } = payload;
    const loginPayload = { loginId, password };

    const checkExistId = await findUserId(loginId);
    const resultFailcode = await loginValidation(loginPayload, checkExistId);

    let packet = {
      success: false,
      sessionId: '',
      failCode: resultFailcode,
    };

    // 로그인 처리
    if (packet.failCode === config.FAIL_CODE.NONE_FAILCODE) {
      const sessionId = uuidv4();

      const redisData = {
        nickname: checkExistId.nickname,
      };

      await redis.createUserToSession(sessionId, redisData);
      packet.success = true;
      packet.sessionId = sessionId;
    }

    const loginResponse = serializeForGate(MESSAGE_TYPE.LOGIN_RESPONSE, packet, 0, [
      payload.sequence,
    ]);
    socket.write(loginResponse);
  } catch (error) {
    console.error(` [ loginRequestHandler ] error =>>> `, error);
  }
};
