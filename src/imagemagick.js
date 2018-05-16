var { spawn, spawnSync } = require("child_process");

module.exports = {
  IMG_COMMAND: (width, height) => [
    "-depth",
    "8",
    "-size",
    `${width}x${height}`,
    "rgba:-",
    "JPEG:-",
  ],
  convert: (buffer, args, callback) => {
    const stdout = [];
    var magick = spawn("convert", args);

    magick.stdout.on("data", function(data) {
      stdout.push(data);
    });

    magick.on("close", function(code) {
      if (!code) {
        callback(Buffer.concat(stdout));
      }
      stdout.length = 0;
      magick.kill();
    });

    magick.stdin.write(buffer);
    magick.stdin.end();
  },
  convertSync: (buffer, args) => {
    var magick = spawnSync("convert", args, { input: buffer });
    callback(magick.output[1]);
  },
};
