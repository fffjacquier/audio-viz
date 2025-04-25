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

/**
 * Objects
 */
const parameters = {}
parameters.radius = 1;
parameters.count = 10000;
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

const geos = ['SphereGeometry', 'PlaneGeometry']
let currentGeometry = 0;

// start or stop the sound by clicking buttons in debug panel
parameters.playSound = () => {
    if (sound.isPlaying) {
        return sound.stop();
    }
    sound.play();
};
gui.add(parameters, 'playSound');

parameters.stopSound = () => {
    if (sound && sound.isPlaying) { 
        sound.stop();
    }
}
gui.add(parameters, 'stopSound');

// gui.add(parameters, 'count');

// Geometry
const geometry = new THREE[geos[currentGeometry]](parameters.radius, 32, 16);

const insideColor = new THREE.Color(parameters.insideColor)
const outsideColor = new THREE.Color(parameters.outsideColor)
const colors = new Float32Array(parameters.count * 3)

for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Position
    const radius = Math.random() * parameters.radius

    // Color
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
}
const dataTexture = new THREE.DataTexture(colors, sizes.width, sizes.height)
dataTexture.needsUpdate = true

// Material
const material = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    transparent: true,
    fragmentShader,
    vertexShader,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uFrequency: new THREE.Uniform(0),
        // uAudioData: new THREE.Uniform(new THREE.DataTexture(analyser.data, 64, 32, THREE.RedFormat)),
        uAudioData: new THREE.Uniform(new THREE.Data3DTexture(dataTexture)),
        uInsideColor: new THREE.Uniform(insideColor),
        uOutsideColor: new THREE.Uniform(outsideColor),
    }
})

gui.add(material, 'wireframe');

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Change geometry
parameters.changeMesh = () => {
    mesh.geometry.dispose();

    if (currentGeometry === 0) {
        mesh.geometry = new THREE.PlaneGeometry(1, 1);
    } else if (currentGeometry === 1) {
        mesh.geometry = new THREE.SphereGeometry(parameters.radius, 32, 16)
    }
    currentGeometry = ++currentGeometry % geos.length
}
gui.add(parameters, 'changeMesh')

gui.add(parameters, 'radius').min(1).max(10).step(1).name('radius').onFinishChange(() => {
    mesh.geometry.dispose()
    if (currentGeometry === 0) {
        mesh.geometry = new THREE.SphereGeometry(parameters.radius, 32, 16)
    }
});

gui.addColor(parameters, 'insideColor').onFinishChange(() => console.log("1"))
gui.addColor(parameters, 'outsideColor').onFinishChange(() => console.log("1"))

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
    material.uniforms.uAudioData.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()