const server = require("server");
const { get, post, socket } = server.router;
const { error } = server.router;
const { file, redirect, send } = server.reply;
const { render, header, download } = server.reply;

const GL = require("./src/gl");
const FFSERVER = require("./src/ffserver");
const CONFIG = require("./src/config");
const IM = require("./src/imagemagick");
const Camera = require("./src/camera");
const Output = require("./src/output");
const { WEBM, MP4, DASH, DASH2 } = require("./src/outputs");

const start = ({ cameraAddr, ffserverStream }) => {
  Output.start({
    ...CONFIG,
    outputOptions: [...DASH],
    output: [ffserverStream], //`"http://localhost:8090/mjpeg.ffm"`
  });

  Camera.start({
    src: cameraAddr, //"http://192.168.1.160:8080/video.jpeg",
    onFrame: buffer => {
      Output.frame(buffer);
    },
  });
};

const stop = () => {
  Output.stop();
  Camera.stop();
};

server(
  { security: { csrf: false } },
  [
    ctx => header("Access-Control-Allow-Origin", "*"),
    ctx =>
      header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      ),
    ctx => (ctx.method.toLowerCase() === "options" ? 200 : false),
  ],
  [
    get("/", ctx => {
      ctx.session.counter = ctx.session.counter || 0;
      return render("index.html");
    }),
    get("/connect", ctx => {
      ctx.session.counter = ctx.session.counter || 0;
      return render("index.html");
    }),

    post("/stop", ctx => {
      stop();
      return "stopped";
    }),

    post("/start", ctx => {
      const { cameraAddr, ffserverStream } = ctx.body;
      if (!cameraAddr || !ffserverStream) {
        throw new Error("Reject");
      }
      start({ cameraAddr, ffserverStream });
      return "started";
    }),
  ],

  socket("connect", ctx => {
    /*setInterval(() => {
      ctx.session.counter++
      ctx.session.save()
      ctx.socket.emit("message", ctx.session.counter)
    }, 1000)*/
  })
);

//start()

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
