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
      "-r",
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
      CONFIG.fps,
      "-an",
    ];
  }

  start(options = {}) {
    if(this.started) return
    this.started = true
    this.ended = false;
    const ffmpegPath = options.ffmpeg || "ffmpeg";

    if(!options.output){
      throw new Error(`FFMPEG needs a .output [] option`)
    }

    const args = [
      ...(options.input || this.getInputOptions(options)),
      "-i",
      "-",
      ...(options.outputOptions || this.getOutputOptions()),
      ...options.output
    ];

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
    this.command.kill()
    this.started = false
    console.log('Killed output');
  }
}

module.exports = new FFMPEG();
