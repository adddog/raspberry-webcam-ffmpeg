var exec = require("child_process").exec;
const CONFIG = require("./config");

class FFMPEG {
  getInputOptions(config) {
    return [
      "-f",
      "rawvideo",
      "-vcodec",
      "rawvideo",
      "-pix_fmt",
      "rgba",
      "-s",
      `${config.width || CONFIG.width}x${config.height ||
        CONFIG.height}`,
      "-framerate",
      config.fps || CONFIG.fps,
    ];
  }

  getOutputOptions() {
    return [
      "-probesize",
      "32",
      "-analyzeduration",
      "128",
      "-use_wallclock_as_timestamps",
      "1",
      "-tune",
      "zerolatency",
      "-r",
      "30",
      "-an",
    ];
  }

  start(options = {}) {
    this.ended = false;
    const ffmpegPath = options.ffmpeg || "ffmpeg";

    const args = [
      ...(options.input || this.getInputOptions(options)),
      "-i",
      "-",
      ...(options.outputOptions || this.getOutputOptions()),
    ];

    if(!options.output){
      throw new Error(`FFMPEG needs a .output option`)
    }

    args.push(option.output)

    console.log(`${ffmpegPath} ${args.join(" ")}`);
    this.command = exec(`${ffmpegPath} ${args.join(" ")}`);
    return this.command;
  }

  frame(buffer) {
    if (!this.ended) {
      this.command.stdin.write(buffer);
    }
  }

  stop() {
    this.ended = true;
    this.command.stdin.end();
  }
}

module.exports = new FFMPEG();
