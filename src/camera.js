const fluentFF = require("fluent-ffmpeg");
const CONFIG = require("./config");
const GL = require("./gl");
const glWriteStream = require("./glWriteStream");

class Camera {
  constructor(config = CONFIG) {
    this.config = config;

    const videoTexture = GL.regl.texture({
      format: "rgba",
      width: this.config.width,
      height: this.config.height,
      type: "uint8",
      mag: "nearest",
      min: "nearest",
      wrapS: "clamp",
      wrapT: "clamp",
    });
  }

  start(options = {}) {
    this.ostream = new glWriteStream(options);
    if(!options.src){
      throw new Error('Camera needs .src')
    }
    this.command = fluentFF(options.src)
      .inputFormat("image2pipe")
      .inputOptions([
        `-framerate ${this.config.framerate || CONFIG.fps}`,
        `-s ${this.config.width}x${this.config.height}`,
        `-vcodec ${this.config.vcodec || "mjpeg"}`,
      ])
      .videoCodec("rawvideo")
      .fps(`${options.framerate || CONFIG.fps}`)
      .size(`${this.config.width}x${this.config.height}`) // HACK
      .outputOptions(
        "-pix_fmt",
        "rgba",
        "-an",
        "-crf",
        "30",
        "-minrate",
        "100k",
        "-maxrate",
        "500k",
        "-bufsize",
        "1024k",
        "-an",
        "-analyzeduration",
        "128",
        "-y",
        "-threads",
        "1",
        "-probesize",
        "32"
      )
      // .videoBitrate("400k")
      .format("rawvideo")
      .on("start", function(cmd) {
        console.log(cmd);
      })
      .on("error", function(err) {
        console.log("An error occurred: " + err.message);
        process.exit();
      })
      .on("end", function() {
        this.ostream = null;
      })
      .pipe(this.ostream, { end: true });

    return this.command;
  }

  stop() {
    this.ostream.stdin.end();
  }
}

module.exports = new Camera();
