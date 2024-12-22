import { config } from '../../config/config.js';
import { logger } from '../../config/index.js';

class ResponseHelper {
  /**
   * 성공 응답
   * @param {object} data - 응답 데이터
   * @param {object} extraFields - 추가 필드
   */
  static success(data = null, extraFields = {}) {
    logger.info('[ extraFields ] ====> success', extraFields);
    return {
      success: true,
      data,
      failCode: config.FAIL_CODE.NONE_FAILCODE,
      ...extraFields,
    };
  }

  /**
   * 실패 응답
   * @param {number} failCode - 실패 코드
   * @param {object} extraFields - 추가 필드
   */
  static fail(failCode = config.FAIL_CODE.UNKNOWN_ERROR, data = null, extraFields = {}) {
    logger.info('[ extraFields ] ====> fail', extraFields);
    return {
      success: false,
      data,
      failCode,
      ...extraFields,
    };
  }
}

export default ResponseHelper;
