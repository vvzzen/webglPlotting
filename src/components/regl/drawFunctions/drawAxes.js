export default function drawAxes(regl, width, height, frag, vert) {
  const drawAxesCmd = regl({
    frag: frag,
    vert: vert,
    attributes: {
      position: regl.buffer([
        [-1, 0], [1, 0], // X-axis
        [0, -1], [0, 1]  // Y-axis
      ]),
    },
    uniforms: {
      stageWidth: regl.prop("stageWidth"),
      stageHeight: regl.prop("stageHeight"),
      color: regl.prop("color"),
    },
    count: 4,
    primitive: "lines",
  });

  return (props) => drawAxesCmd(props);
}