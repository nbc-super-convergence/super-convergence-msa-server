class IntervalManager {
  constructor() {
    this.intervals = new Map();
  }

  /**
   * * 인터벌 추가
   * @param {*} intervalId 인터벌에 사용할 키값
   * @param {*} callback
   * @param {*} interval
   * @param {*} type
   */
  addInterval(intervalId, callback, interval, type = "user") {
    if (!this.intervals.has(intervalId)) {
      this.intervals.set(intervalId, new Map());
    }
    this.intervals.get(intervalId).set(type, setInterval(callback, interval));
  }

  /**
   * * intervalId & type의  인터벌 삭제
   * @param {*} intervalId
   * @param {*} type
   */
  removeInterval(intervalId, type) {
    if (this.intervals.has(intervalId)) {
      const userIntervals = this.intervals.get(intervalId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  /**
   * * intervalId의 인터벌 모두 삭제
   * @param {*} intervalId
   */
  removeAllIntervalById(intervalId) {
    if (this.intervals.has(intervalId)) {
      const userIntervals = this.intervals.get(intervalId);
      userIntervals.forEach((id) => clearInterval(id));
      this.intervals.delete(intervalId);
      clearInterval(this.intervals.get(intervalId));
    }
  }

  /**
   * * 인터벌 전체 삭제
   */
  clearAll() {
    this.intervals.forEach((userIntervals) => {
      userIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
    });

    this.intervals.clear();
  }
}

export default IntervalManager;
