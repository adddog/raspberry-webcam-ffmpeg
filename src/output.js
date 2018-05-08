var spawn = require("child_process").spawn
var exec = require("child_process").exec

module.exports = createMovieRecorderStream

function createMovieRecorderStream(options) {
  var options = Object.assign(
    {
      fps: 15,
      width: 480,
      height: 360,
    },
    options
  )

  var ended = false
  var ffmpegPath = options.ffmpeg || "ffmpeg"
  var fps = options.fps || 30

  var args = [
    ...(options.input || [
      "-f",
      "image2pipe",
      "-framerate",
      "2",
      "-vcodec",
      `mjpeg`,
    ]),
    "-i",
    "-",
    ...(options.output || []),
  ]

  if (options.ffplay) {
    args.push(options.ffplay)
  }

  console.log("Command:")
  console.log(`${ffmpegPath} ${args.join(" ")}`)
  /*var ffmpeg = spawn(ffmpegPath, args, {
    encoding: "buffer",
  });*/
  var ffmpeg = exec(`${ffmpegPath} ${args.join(" ")}`)

  function appendFrame(jpeg) {
    if (!ended) {
      ffmpeg.stdin.write(jpeg)
    }
  }

  function endMovie() {
    ended = true
    ffmpeg.stdin.end()
  }

  var result = {
    frame: appendFrame,
    end: endMovie,
    log: ffmpeg.stderr,
  }

  return result
}
