precision highp float;
attribute vec2 position;
attribute vec3 color;
varying vec3 fragColor;
uniform float pointWidth;
uniform float stageWidth;
uniform float stageHeight;

vec2 normalizeCoords(vec2 position) {
  return vec2(2.0 * ((position.x / stageWidth) - 0.5), -(2.0 * ((position.y / stageHeight) - 0.5)));
}

void main() {
  gl_PointSize = pointWidth;
  fragColor = color;
  gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);
}