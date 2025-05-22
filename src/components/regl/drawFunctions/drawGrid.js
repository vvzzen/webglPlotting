export default function drawGrid(regl, width, height, frag, vert) {
  const gridLines = [];
  for (let i = -1; i <= 1; i += 0.2) { // Adjust step for spacing
    gridLines.push([i, -1], [i, 1]); // Vertical grid lines
    gridLines.push([-1, i], [1, i]); // Horizontal grid lines
  }

  const drawGridCmd = regl({ // Ensure this is inside a function
    frag: frag,
    vert: vert,
    attributes: { position: regl.buffer(gridLines) }, // Fix here
    uniforms: {
      stageWidth: regl.prop("stageWidth"),
      stageHeight: regl.prop("stageHeight"),
      color: regl.prop("color"),
    },
    count: gridLines.length,
    primitive: "lines",
  });

  return (props) => drawGridCmd(props); // Return a function to be called in the loop
}