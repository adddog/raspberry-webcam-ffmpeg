const server = require("server")
const { get, socket } = server.router
const { render } = server.reply

const GL = require("./src/gl")
const IM = require("./src/imagemagick")
const Camera = require("./src/camera")
const Output = require("./src/output")

server(
  [
    get("/", ctx => {
      ctx.session.counter = ctx.session.counter || 0
      return render("index.html")
    }),
    get("/connect", ctx => {
      ctx.session.counter = ctx.session.counter || 0
      return render("index.html")
    }),
  ],
  socket("connect", ctx => {
    // Emit an event every second with +1 on the session
    setInterval(() => {
      // Increment the counter
      ctx.session.counter++

      // For socket.io you need to manually save it
      ctx.session.save()

      // Send the value to the currently connected socket
      ctx.socket.emit("message", ctx.session.counter)
    }, 1000)
  })
)

/***************
 *
 ************** */

const USE_OMX = false
const USE_FFPLAY = true

const OMX =
  "omxplayer -b -r --no-keys -s -I -z --timeout 60 --live -o hdmi  pipe:0"
const FFPLAY = "ffplay -"
const ffoutput = USE_OMX ? OMX : USE_FFPLAY ? FFPLAY : ""

const CONFIG = {
  width: 480,
  height: 360,
  fps: 30,
}
const IMG_COMMAND = [
  "-depth",
  "8",
  "-size",
  `${CONFIG.width}x${CONFIG.height}`,
  "rgba:-",
  "JPEG:-",
]

let _converting = false
const gl = GL(CONFIG)
const output = Output({
  input: [
    "-f",
    "rawvideo",
    "-vcodec",
    "rawvideo",
    "-pix_fmt",
    "rgba",
    "-s",
    `${CONFIG.width}x${CONFIG.height}`,
    "-r",
    CONFIG.fps,
  ],
  output: [
    "-movflags",
    "+faststart",
    "-preset",
    "ultrafast",
    "-r",
    CONFIG.fps,
    "-tune",
    "zerolatency",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "600k",
    "-minrate",
    "300k",
    "-maxrate",
    "600k",
    "-bufsize",
    "1200k",
    "-an",
    "-analyzeduration",
    "1024",
    "-probesize",
    "512",
    "-f",
    "mpegts",
    "-",
    "|",
    ...ffoutput.split(" "),
  ],
})
const camera = Camera(gl, {
  fps: 6,
  onFrame: buffer => {
      _converting = true
      output.frame(buffer)
      /*IM.convert(buffer, IMG_COMMAND, imageBuffer => {
        _converting = false
      })*/
  },
})
camera.play("http://192.168.1.154:8080/video.jpeg")
