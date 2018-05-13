const server = require("server")
const { get, post, socket } = server.router
const { render } = server.reply

const GL = require("../src/gl")
const Camera = require("../src/camera")
const Ffserver = require("../src/output")
const Output = require("../src/output")


const CONFIG = {
  width: 480,
  height: 360,
  fps: 4,
}
const gl = GL(CONFIG)
const camera = Camera(gl, {
  fps: CONFIG.fps,
  onFrame: buffer => {
      output.frame(buffer)
  },
})
camera.play("http://192.168.1.160:8080/video.jpeg")


const startFFserver = ()={
  Ffserver.start()
}


module.exports =


const USE_OMX = true
const USE_FFPLAY = false//true

const OMX =
  `omxplayer -b -r --no-keys -s -I -z --timeout 60 --live --fps ${CONFIG.fps} -o hdmi  pipe:0`
const FFPLAY = "ffplay -"
const ffoutput = USE_OMX ? OMX : USE_FFPLAY ? FFPLAY : ""


const IMG_COMMAND = [
  "-depth",
  "8",
  "-size",
  `${CONFIG.width}x${CONFIG.height}`,
  "rgba:-",
  "JPEG:-",
]

let _converting = false
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
   // "-analyzeduration",
   // "1024",
   // "-probesize",
    // "512",
    "-f",
    "mpegts",
    "-",
    "|",
    ...ffoutput.split(" "),
  ],
})
