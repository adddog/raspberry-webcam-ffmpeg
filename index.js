const server = require("server");
const { get, post, socket } = server.router;
const { render } = server.reply;

const GL = require("./src/gl");
const IM = require("./src/imagemagick");
const Camera = require("./src/camera");
const Output = require("./src/output");
const { WEBM, MP4 } = require("./src/outputs");



const start = () =>{
  Camera.start({
    src: "http://192.168.1.160:8080/video.jpeg"
  })
}



server(
  [
    get("/", ctx => {
      ctx.session.counter = ctx.session.counter || 0;
      return render("index.html");
    }),
    get("/connect", ctx => {
      ctx.session.counter = ctx.session.counter || 0;
      return render("index.html");
    }),

    get("/start", ctx => {}),
  ],

  socket("connect", ctx => {
    // Emit an event every second with +1 on the session
    setInterval(() => {
      // Increment the counter
      ctx.session.counter++;

      // For socket.io you need to manually save it
      ctx.session.save();

      // Send the value to the currently connected socket
      ctx.socket.emit("message", ctx.session.counter);
    }, 1000);
  })
);

start()

/***************
 *
 ************** */

// const CONFIG = {
//   width: 240,
//   height: 180,
//   fps: 3,
// };

// let _converting = false;
// const gl = GL(CONFIG);
// const output = Output({
//   input: [
//     "-f",
//     "rawvideo",
//     "-vcodec",
//     "rawvideo",
//     "-pix_fmt",
//     "rgba",
//     "-s",
//     `${CONFIG.width}x${CONFIG.height}`,
//     "-framerate",
//     CONFIG.fps,
//   ],
//   output: [
//     "-probesize",
//     "32",
//     "-analyzeduration",
//     "128",
//     "-use_wallclock_as_timestamps",
//     "1",
//     "-tune",
//     "zerolatency",
//     "-r",
//     "30",
//     "-an",
//     `"http://localhost:8090/mjpeg.ffm"`,
//     "2>",
//     "log.txt",
//   ],
// });
// const camera = Camera(gl, {
//   fps: CONFIG.fps,
//   ...CONFIG,
//   onFrame: buffer => {
//     _converting = true;
//     output.frame(buffer);
//   },
// });
// camera.play("http://192.168.1.160:8080/video.jpeg");
