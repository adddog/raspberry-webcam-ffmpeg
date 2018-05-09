const { Writable } = require("stream")
const fluentFF = require("fluent-ffmpeg")

module.exports = (gl, options = {}) => {
  const FPS = options.fps || 15
  const PIX_SIZE = options.pixSize || 4
  let WIDTH = options.width || 480
  let HEIGHT = options.width || 360
  let SIZE = WIDTH * HEIGHT * PIX_SIZE

  const videoTexture = gl.createTexture()


  class WriteStream extends Writable {
    constructor() {
      super("binary")
      this._totalLength = 0
      this._frameBuffers = []
    }

    _write(chunk, encoding, callback) {
      this._totalLength += chunk.length
      if (this._totalLength % SIZE === 0) {
        videoTexture({
          format: "rgba",
          width: WIDTH,
          height: HEIGHT,
          type: "uint8",
          mag: "nearest",
          min: "nearest",
          wrapS: "clamp",
          wrapT: "clamp",
          data: Uint8Array.from(
            Buffer.concat(this._frameBuffers, SIZE)
          ),
        })
        gl.drawSingle({
          tex0: videoTexture,
        })
        if (options.onFrame) {
          options.onFrame(Buffer.from(gl.read(SIZE)))
        }
        this._totalLength = 0
        this._frameBuffers.length = 0
      } else {
        this._frameBuffers.push(chunk)
      }
      callback()
    }
  }

  let ostream
  let ffmpegCommand

  function play(src, options = {}) {
    ostream = new WriteStream()
    ffmpegCommand = fluentFF(src)
      .inputFormat("image2pipe")
      .inputOptions([
        `-framerate ${options.framerate || FPS}`,
        `-vcodec ${options.vcodec || "mjpeg"}`,
      ])
      .videoCodec("rawvideo")
      .fps(`${options.framerate || FPS}`)
      //.size(`${WIDTH}:`) // HACK
      .outputOptions("-pix_fmt", "rgba", "-an")
      //.videoBitrate("800k")
      .format("rawvideo")
      .on("start", function(cmd) {
        console.log(cmd)
      })
      .on("error", function(err) {
        console.log("An error occurred: " + err.message)
        process.exit()
      })
      .on("end", function() {
        ostream = null
      })
      .pipe(ostream, { end: true })

    return ffmpegCommand
  }
  return { play }
}