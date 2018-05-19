var spawn = require("child_process").spawn;
var exec = require("child_process").exec;


class FFServer {
  start() {
    this.command = spawn("ffserver", ["-f", "../ffserver.conf"]);
    return this.command
  }

  stop() {
    this.command.kill();
  }
}

module.exports = new FFServer();
