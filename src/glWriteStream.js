const { Writable } = require("stream");
class GLWriteStream extends Writable {
  constructor(props) {
    super("ascii");
    this._frameLength = 0;
    this._frameBuffers = [];

    this._videoTexture = props.videoTexture;
    this.config = props.config;
    this._onFrame = props.onFrame;
    this._gl = props.gl;

    this.SIZE =
      this.config.size ||
      this.config.width *
        this.config.height *
        this.config.numChannels;
  }

  _write(chunk, encoding, callback) {
    this._frameBuffers.push(chunk);
    this._frameLength += chunk.length;

    if (this._frameLength % this.SIZE === 0) {
      this._videoTexture.subimage(
        {
          width: this.config.width,
          height: this.config.height,
          data: Buffer.concat(this._frameBuffers, this.SIZE),
        },
        0,
        0
      );

      this._gl.drawSingle({
        tex0: this._videoTexture,
      });

      this._onFrame(Buffer.from(this._gl.read(this.SIZE).buffer));

      this._frameLength = 0;
      this._frameBuffers.length = 0;
      this._tick += 0.01;
    }

    callback();
  }
}

module.exports = GLWriteStream;
