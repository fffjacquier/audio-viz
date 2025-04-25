import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertexShader.glsl'
import fragmentShader from './shaders/fragmentShader.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Objects
 */
const parameters = {}
parameters.radius = 1;

// Geometry
const geometry = new THREE.SphereGeometry(parameters.radius, 32, 16);

// Material
const material = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uFrequency: new THREE.Uniform(0)
    }
})

gui.add(material, 'wireframe');

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

gui.add(parameters, 'radius').min(1).max(10).step(1).onFinishChange(() => {
    mesh.geometry.dispose()
    mesh.geometry = new THREE.SphereGeometry(parameters.radius, 32, 16)
});

/**
 * Audio
 */
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sounds/sample-1meg.ogg', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop( false );
    sound.setVolume( 0.5 );
})

// create an AudioAnalyser, passing in the sound and desired fftSize
const analyser = new THREE.AudioAnalyser( sound, 32 );

// get the average frequency of the sound
// const data = analyser.getAverageFrequency();
// console.log({analyser, data})

// start or stop the sound by clicking buttons in debug panel
parameters.playSound = () => {
    sound.play();
};
gui.add(parameters, 'playSound');

parameters.stopSound = () => {
    sound.stop();
}
gui.add(parameters, 'stopSound');

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // mat
    material.uniforms.uTime.value = elapsedTime
    material.uniforms.uFrequency.value = analyser.getAverageFrequency()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()