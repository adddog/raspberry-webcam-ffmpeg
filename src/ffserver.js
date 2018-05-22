const spawn = require("child_process").spawn;

class Commmands {
  start() {
    spawn("export", ["DISPLAY=:0"]);
    // spawn("systemctl", ["start", "ffserver.service"]);
  }

  stop() {
    // spawn("systemctl", ["stop", "ffserver.service"]);
  }
}

module.exports = new Commmands();
