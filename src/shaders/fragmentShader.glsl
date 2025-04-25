uniform float uTime;
uniform float uFrequency;
uniform vec3 uInsideColor;
uniform vec3 uOutsideColor;
uniform sampler2D uAudioData;

varying vec2 vUv;

void main() {
  #include <colorspace_fragment>;

  vec3 color = vec3(0.0);

  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 5.0);

  float pct = abs(sin( uFrequency / uTime));

  // Mix uses pct (a value from 0-1) to mix the two colors
  color = mix(uInsideColor, uOutsideColor, pct);

  gl_FragColor = vec4(color,1.);
/*
  vec3 backgroundColor = vec3( 0.125, 0.125, 0.125 );
  vec3 color = vec3( 1.0, 1.0, 0.0 );

  float f = texture2D( uAudioData, vec2( vUv.x, 0.0 ) ).r;

  float i = step( vUv.y, f ) * step( f - 0.0125, vUv.y );

  gl_FragColor = vec4( mix( backgroundColor, color, i ), 1.0 );
*/
  /*  
  // Light point
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 5.0);

  // Final color
  vec3 color = mix(vec3(0.0), vColor, strength);

  gl_FragColor = vec4(vec3(strength), 1.0);
  */
}
