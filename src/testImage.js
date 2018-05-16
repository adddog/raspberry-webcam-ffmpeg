module.exports = {
  rgba: (w, h) => {
    const size = w * h * 4;
    const data = new Uint8Array(size);
    for (var i = 0; i < size; i += 4) {
      const y = i % w;
      const gray = Math.floor(y / h * 255);
      var red = (data[i] = gray);
      var green = (data[i + 1] = gray);
      var blue = (data[i + 2] = gray);
      var alpha = (data[i + 3] = 255);
    }
    return data;
  },
};
