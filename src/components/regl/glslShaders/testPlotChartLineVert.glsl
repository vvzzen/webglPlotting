precision highp float;
attribute vec2 position;
uniform float stageWidth;
uniform float stageHeight;
uniform mat4 projection, view;  // 🔥 Camera matrices

void main() {
  gl_Position = projection * view * vec4(position, 0.0, 1.0);
}
