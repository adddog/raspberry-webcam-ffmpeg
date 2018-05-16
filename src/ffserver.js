var spawn = require("child_process").spawn;
var exec = require("child_process").exec;


class FFServer {
  start() {
    this.ffserver = spawn("ffserver", ["-f", "../ffserver.conf"]);
    return this.ffserver
  }

  stop() {
    this.ffserver.kill();
  }
}

module.exports = new FFServer();
