precision highp float;
attribute vec2 position;
uniform float stageWidth;
uniform float stageHeight;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
