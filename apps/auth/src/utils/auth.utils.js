import JoiUtils from './joi.util.js';
import bcrypt from 'bcrypt';
import { redis } from '../redis.js';
import { findUserNickname } from '../db/user/user.db.js';
import { config } from '@repo/common/config';

export const registerValidation = async (payload, loginId) => {
  const { value, error } = await JoiUtils.validateSignUp(payload);

  // JOI 검증 에러
  if (error) {
    return config.FAIL_CODE.VALIDAION_ERROR;
  }

  // 패스워드 확인 불일치
  if (payload.password !== payload.passwordConfirm) {
    return config.FAIL_CODE.NOT_MATCH_PASSWORD_CONFIRM;
  }

  try {
    // 동시성 제어
    const lockAcquired = await redis.createLockKey('register', value.loginId);
    if (!lockAcquired) {
      return config.FAIL_CODE.UNKNOWN_ERROR;
    }

    // 이미 존재하는 아이디
    if (loginId) {
      return config.FAIL_CODE.ALREADY_EXIST_ID;
    }

    // 이미 존재하는 닉네임
    const existNick = await findUserNickname(payload.nickname);
    if (existNick) {
      return config.FAIL_CODE.ALREADY_EXIST_NICKNAME;
    }
    return config.FAIL_CODE.NONE_FAILCODE;
  } finally {
    await redis.deleteLockKey('register', value.loginId);
  }
};

export const loginValidation = async (payload, loginId) => {
  const { value, error } = await JoiUtils.validateSignIn(payload);

  // JOI 검증 에러
  if (error) {
    return config.FAIL_CODE.VALIDAION_ERROR;
  }

  // DB 체크
  if (!loginId) {
    return config.FAIL_CODE.ID_OR_PASSWORD_MISS;
  }

  // 비밀번호 체크
  const checkPassword = await bcrypt.compare(value.password, loginId.password);
  if (!checkPassword) {
    return config.FAIL_CODE.ID_OR_PASSWORD_MISS;
  }

  try {
    // 동시성 제어
    const lockAcquired = await redis.createLockKey('login', value.loginId);
    if (!lockAcquired) {
      return config.FAIL_CODE.UNKNOWN_ERROR;
    }

    // 중복로그인 체크
    const isAlreadyLoggedIn = await redis.getUserToLogin(value.loginId);
    if (isAlreadyLoggedIn === 1) {
      return config.FAIL_CODE.ALREADY_LOGGED_IN_ID;
    }
    return config.FAIL_CODE.NONE_FAILCODE;
  } finally {
    await redis.deleteLockKey('login', value.loginId);
  }
};
