class Vector {
  constructor({ x, y, z }) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  set(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
  }
}

export default Vector;
