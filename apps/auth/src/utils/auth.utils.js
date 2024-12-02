import JoiUtils from './joi.util.js';
import bcrypt from 'bcrypt';
import { redis } from '../redis.js';
import { findUserNickname } from '../db/user/user.db.js';
import { config } from '@repo/common/config';

export const registerValidation = async (payload, loginId) => {
  const { value, error } = await JoiUtils.validateSignUp(payload);

  // JOI 검증 에러
  if (error) {
    console.error(`VALIDAION_ERROR ==>>  `, error.details[0].message);
    return config.FAIL_CODE.VALIDAION_ERROR;
  }

  // 패스워드 확인 불일치
  if (payload.password !== payload.passwordConfirm) {
    console.error('NOT_MATCH_PASSWORD_CONFIRM', '패스워드 확일 불일치');
    return config.FAIL_CODE.NOT_MATCH_PASSWORD_CONFIRM;
  }

  // 동시성 제어
  const lockAcquired = await redis.createLockKey('register', value.loginId);
  if (!lockAcquired) {
    console.error('ALREADY_EXIST_ID', '동시 접근, 탈락');
    return config.FAIL_CODE.ALREADY_EXIST_ID;
  }

  // 이미 존재하는 아이디
  if (loginId) {
    console.error('ALREADY_EXIST_ID', '이미 가입된 ID');
    return config.FAIL_CODE.ALREADY_EXIST_ID;
  }

  // 이미 존재하는 닉네임
  const existNick = await findUserNickname(payload.nickname);

  if (existNick) {
    console.error('ALREADY_EXIST_NICKNAME', '이미 가입된 NICK_NAME');
    return config.FAIL_CODE.ALREADY_EXIST_NICKNAME;
  }

  return config.FAIL_CODE.NONE_FAILCODE;
};

export const loginValidation = async (payload, loginId) => {
  const { value, error } = await JoiUtils.validateSignIn(payload);

  // JOI 검증 에러
  if (error) {
    console.error(`VALIDAION_ERROR ==>>  `, error.details[0].message);
    return config.FAIL_CODE.VALIDAION_ERROR;
  }

  // DB 체크
  if (!loginId) {
    console.error('ID_OR_PASSWORD_MISS ==>>', ' 존재하지 않는 ID');
    return config.FAIL_CODE.ID_OR_PASSWORD_MISS;
  }

  // 비밀번호 체크
  const checkPassword = await bcrypt.compare(value.password, loginId.password);
  if (!checkPassword) {
    console.error('ID_OR_PASSWORD_MISS ==>>', '비밀번호 불일치');
    return config.FAIL_CODE.ID_OR_PASSWORD_MISS;
  }

  // 중복 로그인 검사 KEY
  const loginKey = await redis.createUserLogin(loginId.nickname);
  if (!loginKey) {
    console.error('ALREADY_LOGGED_IN_ID ==>>', '이미 접속중인 ID');
    return config.FAIL_CODE.ALREADY_LOGGED_IN_ID;
  }

  return config.FAIL_CODE.NONE_FAILCODE;
};
