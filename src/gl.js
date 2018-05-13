const headlessContext = require("gl")
const regl = require("regl")

const VERTEX_BUFFER = [[0, 0], [0, 1], [1, 0], [1, 1]]

module.exports = (config = {}) => {
  if (!config.width || !config.height) {
    throw new Error(`No width and height specified`)
  }

  const gl = regl({
    gl: headlessContext(config.width, config.height, {
      preserveDrawingBuffer: true,
    }),
  })

  gl.clear({
    color: [0, 0, 1, 1],
    depth: 1,
    stencil: 0,
  })

  const drawSingle = props => {
    gl.clear({
      color: [0, 0, 0, 1],
      depth: 1,
      stencil: 0,
    })

    return gl({
      vert: `
          precision lowp float;
          attribute vec2 position;
          varying vec2 texCoord;

          void main() {
            texCoord = position;
            gl_Position = vec4((position * 2.0 - 1.0) * vec2(1,1), 0.0, 1.0);
          }
          `,

      frag: `

          #define GAMMA 0.65
        #define REGIONS 5.
        #define LINES 0.5
        #define BASE 2.5
        #define GREEN_BIAS 0.9

          precision lowp float;
          uniform sampler2D tex0;
          varying vec2 texCoord;

          vec3 Posterize(vec3 color)
          {
            color = pow(color, vec3(GAMMA, GAMMA, GAMMA));
            color = floor(color * REGIONS)/REGIONS;
            color = pow(color, vec3(1.0/GAMMA));
            return color.rgb;
          }

          void main() {
            vec3 color = texture2D(tex0, texCoord).rgb;
            color = Posterize(color);
            gl_FragColor = vec4(color,1);
          }

          `,

      uniforms: {
        tex0: gl.prop("tex0"),
      },
      attributes: {
        position: VERTEX_BUFFER,
      },
      primitive: "triangle strip",
      count: 4,
    })(props)
  }

  return {
    read: SIZE => gl.read(new Uint8Array(SIZE)),
    regl: gl,
    createTexture: () => gl.texture(),
    drawSingle: drawSingle,
  }
}
