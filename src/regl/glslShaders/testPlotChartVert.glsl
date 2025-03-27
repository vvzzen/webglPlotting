precision highp float;
attribute vec2 position;
uniform float stageWidth;
uniform float stageHeight;

vec2 normalizeCoords(vec2 pos) {
  return vec2(
    2.0 * (pos.x / stageWidth - 0.5),
    -(2.0 * (pos.y / stageHeight - 0.5))
  );
}

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
