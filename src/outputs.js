const CONFIG = require("./config");

module.exports = {
  MP4: [
    "-movflags",
    "+faststart",
    "-preset",
    "ultrafast",
    "-r",
    "30",
    "-tune",
    "zerolatency",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-b:v",
    "600k",
    "-crf",
    "30",
    "-minrate",
    "300k",
    "-maxrate",
    "600k",
    "-bufsize",
    "1200k",
    "-an",
    "-analyzeduration",
    "512",
    "-probesize",
    "128",
    "-f",
    "mpegts",
  ],
  WEBM: [
    "-c:v",
    "libvpx",
    "-r",
    CONFIG.fps,
    "-g",
    CONFIG.fps,
  ],
};
