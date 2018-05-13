// const server = require("server")
/*const { get, post, socket } = server.router
const { render } = server.reply*/

const GL = require("./src/gl")
const IM = require("./src/imagemagick")
const Camera = require("./src/camera")
const Output = require("./src/output")
const {WEBM, MP4} = require("./src/outputs")

/*server(
  [
    get("/", ctx => {
      ctx.session.counter = ctx.session.counter || 0
      return render("index.html")
    }),
    get("/connect", ctx => {
      ctx.session.counter = ctx.session.counter || 0
      return render("index.html")
    }),
    get("/start", ctx => {
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
*/
/***************
 *
 ************** */

const USE_OMX = false
const USE_FFPLAY = true
const USE_UDP = "udp://192.168.1.134:3333"
const OMX = `- | mplayer -fps 30 -aspect 16:9 -fs -zoom -cache 1024 -`
//const OMX =
 // "- | omxplayer -b -r -g --no-keys -s -I -z --timeout 60 -o hdmi --fps 1 pipe:0"
const FFPLAY = "- | ffplay -"
const ffoutput = USE_OMX ? OMX : USE_FFPLAY ? FFPLAY : USE_UDP;

const CONFIG = {
  width: 480,
  height: 360,
  fps: 3,
}
const IMG_COMMAND = [
  "-depth",
  "8",
  "-size",
  `${CONFIG.width}x${CONFIG.height}`,
  "rgba:-",
  "JPEG:-",
];

let _converting = false;
const gl = GL(CONFIG);
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
    "-framerate",
    CONFIG.fps,
  ],
  output: [
 //   ...WEBM,
//...MP4,
    /*"-s",
    `${CONFIG.width}x${CONFIG.height}`,
    "-r",
    CONFIG.fps,
    "-framerate",
    CONFIG.fps,*/
   "-probesize","32", "-analyzeduration", "128","-use_wallclock_as_timestamps","1","-tune",
    "zerolatency",
   // "-c:v",
    //"mpeg1video",
    "-r",
    "30",
    /*"-f",
    "alsa",*/
     "-an",
//"udp://192.168.1.81:3333"
    `"http://localhost:8090/feed2.ffm"`,
"2>",
"log.txt"
  ],
});
const camera = Camera(gl, {
  fps: CONFIG.fps,
  onFrame: buffer => {
    _converting = true;
    console.log(buffer.length);
    output.frame(buffer);
    /*IM.convert(buffer, IMG_COMMAND, imageBuffer => {
        _converting = false
      })*/
  },
})
camera.play("http://192.168.1.160:8080/video.jpeg")
