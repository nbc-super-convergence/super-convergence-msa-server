import { MESSAGE_TYPE } from '../../constants/header.js';
import JoiUtils from '../../utils/joi.util.js';
import { createUser, findUserId } from '../../db/user/user.db.js';
import { serialize } from '@repo/common/utils';
import { getPayloadNameByMessageType } from '../index.js';
import { dbConfig } from '../../config/db.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from '../../constants/env.js';

/**
 * 회원가입 핸들러
 * TODO : globalFailCode
 */
export const registerRequestHandler = async ({ socket, payload }) => {
  try {
    const payloadType = getPayloadNameByMessageType(MESSAGE_TYPE.REGISTER_RESPONSE);

    console.log(dbConfig);
    if (payload.password !== payload.passwordConfirm) {
      const responsePayload = {
        success: false,
        message: '비밀번호 확인이 일치하지 않습니다. ',
        failCode: 2,
      };

      const registerResponse = serialize(
        MESSAGE_TYPE.REGISTER_RESPONSE,
        responsePayload,
        payloadType,
      );
      socket.write(registerResponse);

      return;
    }
    const { loginId, password, passwordConfirm, nickname } = await JoiUtils.validateSignUp(payload);

    const checkExistId = await findUserId(loginId);
    if (checkExistId) {
      const responsePayload = {
        success: false,
        message: '이미 존재하는 ID',
        failCode: 2,
      };

      const registerResponse = serialize(
        MESSAGE_TYPE.REGISTER_RESPONSE,
        responsePayload,
        payloadType,
      );
      socket.write(registerResponse);

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUserId = await createUser(loginId, hashedPassword, nickname);

    const responsePayload = {
      success: true,
      message: 'Register Success',
      failCode: 0,
    };

    const registerResponse = serialize(
      MESSAGE_TYPE.REGISTER_RESPONSE,
      responsePayload,
      payloadType,
    );
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
    // 주의
    console.log('111111111111111');
    const payloadType = getPayloadNameByMessageType(MESSAGE_TYPE.LOGIN_RESPONSE);
    const { loginId, password } = await JoiUtils.validateSignIn(payload);

    const checkExistId = await findUserId(loginId);

    if (!checkExistId) {
      // 없는 아이디
      const packet = {
        success: false,
        message: 'Invalid ID or password',
        token: '',
        info: '',
        failCode: 2,
      };

      const loginResponse = serialize(MESSAGE_TYPE.LOGIN_RESPONSE, packet, 0, payloadType);
      socket.write(loginResponse);
      return;
    }

    const checkPassword = await bcrypt.compare(password, checkExistId.password);

    if (!checkPassword) {
      // 비밀번호 틀림
      const packet = {
        success: false,
        message: 'Invalid ID or password',
        token: '',
        info: '',
        failCode: 2,
      };

      const loginResponse = serialize(MESSAGE_TYPE.LOGIN_RESPONSE, packet, 0, payloadType);
      socket.write(loginResponse);
      return;
    }

    // TODO : 중복 로그인 체크..?
    // 패킷생성

    const accessToken = jwt.sign(
      {
        loginId: checkExistId.loginId,
      },
      ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: '1h' },
    );

    const totalToken = `Bearer ${accessToken}`;

    const userData = {
      id: checkExistId.id,
      nickname: checkExistId.nickname,
    };

    const packet = {
      success: true,
      message: 'Login Seccess',
      token: totalToken,
      info: userData,
      failCode: 0,
    };

    console.log('2222222222222222222');

    const loginResponse = serialize(MESSAGE_TYPE.LOGIN_RESPONSE, packet, 0, payloadType);
    socket.write(loginResponse);
  } catch (error) {
    console.error(` [ loginRequestHandler ] error =>>> `, error);
  }
};
