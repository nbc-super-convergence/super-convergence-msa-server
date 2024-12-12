import joi from 'joi';

export default class JoiUtils {
  /**
   * 회원가입 데이터 검증
   * @param {*} body
   * @returns
   */
  static async validateSignUp(body) {
    const joiSchema = joi.object({
      password: joi
        .string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .min(4)
        .max(16)
        .required()
        .messages({
          'string.base': '비밀번호는 문자열이어야 합니다.',
          'string.min': `비밀번호의 길이는 최소 {#limit}자 이상입니다.`,
          'string.max': `비밀번호의 길이는 최대 {#limit}자 이하입니다.`,
          'any.required': '비밀번호를 입력해주세요.',
        }),
      passwordConfirm: joi
        .string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .min(4)
        .max(16)
        .required()
        .messages({
          'string.base': '비밀번호는 문자열이어야 합니다.',
          'string.min': `비밀번호의 길이는 최소 {#limit}자 이상입니다.`,
          'string.max': `비밀번호의 길이는 최대 {#limit}자 이하입니다.`,
          'any.required': '비밀번호를 입력해주세요.',
        }),

      loginId: joi.string().min(4).max(12).required().messages({
        'string.base': '아이디는 문자열이어야 합니다.',
        'string.min': `아이디의 길이는 최소 {#limit}자 이상입니다.`,
        'string.max': `아이디의 길이는 최대 {#limit}자 이하입니다.`,
        'any.required': '아이디를 입력해주세요.',
      }),

      nickname: joi.string().min(2).max(10).required().messages({
        'string.base': '이름은 문자열이어야 합니다.',
        'string.min': `이름의 길이는 최소 {#limit}자 이상입니다.`,
        'string.max': `이름의 길이는 최대 {#limit}자 이하입니다.`,
        'any.required': '닉네임을 입력해주세요.',
      }),
    });

    const validation = joiSchema.validate(body);

    return validation;
  }

  /**
   * 로그인 데이터 검증
   * @param {*} body
   * @returns
   */
  static async validateSignIn(body) {
    const joiSchema = joi.object({
      loginId: joi.string().min(4).max(12).required().messages({
        'string.base': '아이디는 문자열이어야 합니다.',
        'string.min': `아이디의 길이는 최소 {#limit}자 이상입니다.`,
        'string.max': `아이디의 길이는 최대 {#limit}자 이하입니다.`,
        'any.required': '아이디를 입력해주세요.',
      }),
      password: joi
        .string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .min(4)
        .max(16)
        .required()
        .messages({
          'string.base': '비밀번호는 문자열이어야 합니다.',
          'string.min': `비밀번호의 길이는 최소 {#limit}자 이상입니다.`,
          'string.max': `비밀번호의 길이는 최대 {#limit}자 이하입니다.`,
          'any.required': '비밀번호를 입력해주세요.',
        }),
    });

    const validation = joiSchema.validate(body);

    return validation;
  }
}
