module.exports = {
  rgba: (w, h, randomColor = false) => {
    const size = w * h * 4;
    const data = new Uint8Array(size);
    for (var i = 0; i < size; i += 4) {
      const y = i % w;
      const x = i % h;
      const gray = Math.floor(y / h * 255);
      let color = [gray, gray, gray];
      if (i > 88200) {
        color = [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ];
      }
      var red = (data[i] = randomColor ? color[0] : gray);
      var green = (data[i + 1] = randomColor ? color[1] : gray);
      var blue = (data[i + 2] = randomColor ? color[2] : gray);
      var alpha = (data[i + 3] = 255);
    }
    return data;
  },
};
