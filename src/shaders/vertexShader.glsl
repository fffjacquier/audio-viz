uniform float uTime;
uniform float uFrequency;

varying vec2 vUv;

#include ./includes/perlin.glsl

void main() {
  float noise = 5. * pnoise(position + uTime, vec3(10.0));

  // float displacement = uFrequency * noise;
  float displacement = (uFrequency / 5.0) * (noise / 10.0);
  
  vec3 nextPosition = position + normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(nextPosition, 1.0);

  vUv = uv;
}
