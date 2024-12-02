class TimeoutManager {
  constructor() {
    this.timeouts = new Map();
  }

  /**
   * * 인터벌 추가
   * @param {*} intervalId 인터벌에 사용할 키값
   * @param {*} callback
   * @param {*} timeout
   * @param {*} type
   */
  addTimeout(timeoutId, callback, timeout, type = 'user') {
    if (!this.timeouts.has(timeoutId)) {
      this.timeouts.set(timeoutId, new Map());
    }
    this.timeouts.get(timeoutId).set(type, setTimeout(callback, timeout));
  }

  /**
   * * timeout & type의  인터벌 삭제
   * @param {*} timeoutId
   * @param {*} type
   */
  removeTimeout(timeoutId, type) {
    if (this.timeouts.has(timeoutId)) {
      const userTimeouts = this.timeouts.get(timeoutId);
      if (userTimeouts.has(type)) {
        clearTimeout(userTimeouts.get(type));
        userTimeouts.delete(type);
      }
    }
  }

  /**
   * * timeoutId 인터벌 모두 삭제
   * @param {*} timeoutId
   */
  removeAllTimeoutById(timeoutId) {
    if (this.timeouts.has(timeoutId)) {
      const userTimeouts = this.timeouts.get(timeoutId);
      userTimeouts.forEach((id) => clearTimeout(id));
      this.timeouts.delete(timeoutId);
      clearTimeout(this.timeouts.get(timeoutId));
    }
  }

  /**
   * * 인터벌 전체 삭제
   */
  clearAll() {
    this.timeouts.forEach((userTimeouts) => {
      userTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    });

    this.timeouts.clear();
  }
}

export default TimeoutManager;
