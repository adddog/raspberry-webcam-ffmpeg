var spawn = require("child_process").spawn;
var exec = require("child_process").exec;

const ARGS = ["-c:v", "libvpx"];

class FFServer {
  start() {
    this.ffserver = spawn("ffserver", ["-f", "../ffserver.conf"]);
    return ARGS;
  }

  stop() {
    this.ffserver.kill();
  }
}

module.exports = new FFServer();
