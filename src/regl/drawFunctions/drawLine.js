export default function drawLine(regl, points, width, height, frag, vert) {
  const drawLineCmd = regl({
    frag: frag,
    vert: vert,
    attributes: {
      position: regl.buffer(points.map((d) => [d.x, d.y])),
    },
    uniforms: {
      stageWidth: regl.prop("stageWidth"),
      stageHeight: regl.prop("stageHeight"),
      color: regl.prop("color"),
    },
    count: points.length,
    primitive: "line strip",
  });

  return (props) => drawLineCmd(props);
}
