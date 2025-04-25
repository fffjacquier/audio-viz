uniform float uTime;
uniform float uFrequency;

#include ./includes/perlin.glsl

void main() {
  float noise = pnoise(position + uTime, vec3(10.0));
  float displacement = (uFrequency / 30.0) * (noise / 10.0);
  
  vec3 nextPosition = position + normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(nextPosition, 1.0);
}
