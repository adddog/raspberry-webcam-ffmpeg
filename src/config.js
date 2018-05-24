class CONFIG {
  constructor() {
    this._width = 240;
    this._height = 180;
    this._fps = 18;
  }

  update(ctx = {}) {
    for (const key in ctx) {
      if(this[key]){
        this[key] = ctx[key];
      }
    }
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get fps() {
    return this._fps;
  }

  set width(v) {
    this._width = v;
  }

  set height(v) {
    this._height = v;
  }

  set fps(v) {
    this._fps = v;
  }
}

module.exports = new CONFIG();
