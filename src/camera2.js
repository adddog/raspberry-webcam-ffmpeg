const { Writable } = require("stream");
const fs = require("fs");
const fluentFF = require("fluent-ffmpeg");
const performance = require("performance-now");
const IM = require("./imagemagick");
const testImage = require("./testImage");

const LOG = true;

module.exports = (gl, options = {}) => {
  const FPS = options.fps || 15;
  const PIX_SIZE = options.pixSize || 4;
  let WIDTH = options.width || 480;
  let HEIGHT = options.height || 360;
  let SIZE = WIDTH * HEIGHT * PIX_SIZE;
  let ostream;
  let ffmpegCommand;

  function play(src, options = {}) {
    let _totalLength = 0;
    const _frameBuffers = [];
    let _tick = 1;
    var command = fluentFF(src)
      .inputFormat("image2pipe")
      .inputOptions([
        `-framerate ${options.framerate || FPS}`,
        `-s ${WIDTH}x${HEIGHT}`,
        `-vcodec ${options.vcodec || "mjpeg"}`,
      ])
      .videoCodec("rawvideo")
      .fps(`${options.framerate || FPS}`)
      .size(`${WIDTH}x${HEIGHT}`) // HACK
      .outputOptions("-pix_fmt", "rgba")
      .videoBitrate("400k")
      .format("rawvideo")
      .on("error", function(err) {
        console.log("An error occurred: " + err.message);
      })
      .on("end", function() {
        console.log("Processing finished !");
      });

    var ffstream = command.pipe();
    ffstream.on("data", function(chunk) {
      _totalLength += chunk.length;
      _frameBuffers.push(chunk);
      if (_totalLength % SIZE === 0) {
        const buffer = Buffer.concat(_frameBuffers, SIZE);
        console.log("wrote buffer", _totalLength);
        //fs.writeFile(`${Math.floor(_tick)}.jpeg`, buffer);
        //fs.writeFile(`${Math.floor(_tick)}.rgba`, buffer);

        IM.convert(
          buffer,
          IM.IMG_COMMAND(WIDTH, HEIGHT),
          imageBuffer => {
            fs.writeFileSync(
              `${Math.floor(_tick)}.jpeg`,
              imageBuffer
            );
          }
        );

        _totalLength = 0;
        _frameBuffers.length = 0;
        _tick += 1;
      }
      /*} else {
        _frameBuffers.push(chunk);
        console.log(_frameBuffers.length, chunk.length);
      }*/
    });
    console.log(src);
    return ffmpegCommand;
  }
  return { play };
};
