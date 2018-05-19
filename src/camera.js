const fluentFF = require("fluent-ffmpeg")
const CONFIG = require("./config")
const GL = require("./gl")
const glWriteStream = require("./glWriteStream")

class Camera {
  constructor(config = CONFIG) {
    this.config = config

    this.videoTexture = GL.regl.texture({
      format: "rgba",
      width: this.config.width,
      height: this.config.height,
      type: "uint8",
      mag: "nearest",
      min: "nearest",
      wrapS: "clamp",
      wrapT: "clamp",
    })
  }

  start(options = {}) {
    if(this.started) return
    this.started = true

    this.ostream = new glWriteStream({
      gl: GL,
      onFrame: options.onFrame,
      videoTexture: this.videoTexture,
      config: this.config,
    })

    if (!options.src) {
      throw new Error("Camera needs .src")
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
        console.log(cmd)
      })
      .on("error", function(err) {
        console.log("An error occurred: " + err.message)
        process.exit()
      })
      .on("end", function() {
        this.ostream = null
      })
      this.command.pipe(this.ostream, { end: true })
  }

  stop() {
    this.command.kill()
    this.started = false
    console.log('Killed camera');
  }
}

module.exports = new Camera()
