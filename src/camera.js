const { Writable } = require("stream");
const fluentFF = require("fluent-ffmpeg");
const performance = require("performance-now");

module.exports = (gl, options = {}) => {
  const FPS = options.fps || 15;
  const PIX_SIZE = options.pixSize || 4;
  let WIDTH = options.width || 480;
  let HEIGHT = options.width || 360;
  let SIZE = WIDTH * HEIGHT * PIX_SIZE;

  const videoTexture = gl.createTexture();
  var _t1 = performance();
  class WriteStream extends Writable {
    constructor() {
      super("binary");
      this._totalLength = 0;
      this._frameBuffers = [];
    }

    _write(chunk, encoding, callback) {
      this._totalLength += chunk.length;
      if (this._totalLength % SIZE === 0) {
         console.log("Got frame");

        var _d1 = performance();

        videoTexture({
          format: "rgba",
          width: WIDTH,
          height: HEIGHT,
          type: "uint8",
          mag: "nearest",
          min: "nearest",
          wrapS: "clamp",
          wrapT: "clamp",
          data: Buffer.concat(this._frameBuffers, SIZE),
        });


        gl.drawSingle({
          tex0: videoTexture,
        });

        _t1 = performance();

        console.log(
          `took ${_t1 - _d1} to get new frame & concat the buffers & draw`
        );

        if (options.onFrame) {
          //options.onFrame(Buffer.from(gl.read(SIZE).buffer));
        }
        this._totalLength = 0;
        this._frameBuffers.length = 0;
        //console.log('\n');
      } else {
        this._frameBuffers.push(chunk);
      }
      callback();
    }
  }

  let ostream;
  let ffmpegCommand;

  function play(src, options = {}) {
    ostream = new WriteStream();
    ffmpegCommand = fluentFF(src)
      .inputFormat("image2pipe")
      .inputOptions([
        `-framerate ${options.framerate || FPS}`,
        `-vcodec ${options.vcodec || "mjpeg"}`,
      ])
      .videoCodec("rawvideo")
      .fps(`${options.framerate || FPS}`)
      //.size(`${WIDTH}:`) // HACK
      .outputOptions(
        "-pix_fmt",
        "rgba",
        "-an",
        "-crf",
        "30",
        "-minrate",
        "100k",
        "-maxrate",
        "300k",
        "-bufsize",
        "500k",
        "-an",
        "-analyzeduration",
        "128",
        "-probesize",
        "32"
      )
      .videoBitrate("200k")
      .format("rawvideo")
      .on("start", function(cmd) {
        console.log(cmd);
      })
      .on("error", function(err) {
        console.log("An error occurred: " + err.message);
        process.exit();
      })
      .on("end", function() {
        ostream = null;
      })
      .pipe(ostream, { end: true });

    return ffmpegCommand;
  }
  return { play };
};
