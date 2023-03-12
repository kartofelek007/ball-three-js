import './style.css';
import * as THREE from 'three';
import atmosphereVertexShader from './shaders/asmoshpereVertex.glsl';
import atmosphereFragmentShader from './shaders/atmoshereFragment.glsl';
import * as dat from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

let debug = false;

const canvasCnt = document.querySelector('.banner-video-cnt');
const canvas = document.querySelector('.banner-video');
const canvasW = innerWidth; //canvasCnt.offsetWidth;
const canvasH = innerHeight; //canvasCnt.offsetHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvasW / canvasH, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas,
});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(canvasW, canvasH);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const postRenderer = new EffectComposer(renderer);

const params = {
    bloomStrength: 0.3,
    bloomThreshold: 0,
    bloomRadius: 0,
};
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;
composer.addPass(bloomPass);

const sphereParameters = {
    radius: 7.5,
    verticleH: 100,
    verticleV: 60,
    x: 4,
    y: -2,
    z: 0,
};

/* #region  sphere */
const geometry = new THREE.SphereGeometry(
    sphereParameters.radius,
    sphereParameters.verticleH,
    sphereParameters.verticleV
);

const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x393968,
    roughness: 0.7,
    metalness: 0.8,
    opacity: 0.9,
    transparent: true,
});

const sphereSolid = new THREE.Mesh(geometry, sphereMaterial);
sphereSolid.position.set(
    sphereParameters.x,
    sphereParameters.y,
    sphereParameters.z
);
scene.add(sphereSolid);
/* #endregion */


/* #region  verticles on sphere */
const group = new THREE.Group();
let vertices = geometry.attributes.position.array;
for (let i = 0; i < geometry.attributes.position.count; i++) {
    const spherePoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 4, 4),
        new THREE.MeshStandardMaterial({
            color: 0x86dfdf,
            emissive: 0x86dfdf,
            emissiveIntensity: 2,
        })
    );
    spherePoint.position.set(
        vertices[i * 3 + 0],
        vertices[i * 3 + 1],
        vertices[i * 3 + 2]
    );
    group.add(spherePoint);
}
scene.add(group);
group.position.set(sphereParameters.x, sphereParameters.y, sphereParameters.z);
/* #endregion */


/* #region  wire sphere */
const sphereForWire = new THREE.SphereGeometry(
    sphereParameters.radius,
    sphereParameters.verticleH,
    sphereParameters.verticleV
);

const wireframe = new THREE.WireframeGeometry(sphereForWire);
var wireMaterial = new THREE.LineBasicMaterial({
    color: 0x86dfdf,
    linewidth: 1, //to i tak nie dziala według specyfikacji
    linejoin: 'round',
    linecap: 'round',
});
const line = new THREE.LineSegments(wireframe, wireMaterial);

line.material.depthTest = true;
line.material.opacity = 0.55;
line.material.transparent = true;
line.position.set(sphereParameters.x, sphereParameters.y, sphereParameters.z);
scene.add(line);
/* #endregion */


/* #region  glow sphere */
const sphereGlow = new THREE.Mesh(
    new THREE.SphereGeometry(
        sphereParameters.radius,
        sphereParameters.verticleH,
        sphereParameters.verticleV
    ),
    new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
    })
);

sphereGlow.scale.set(1.5, 1.5, 1.5);
sphereGlow.position.set(
    sphereParameters.x,
    sphereParameters.y,
    sphereParameters.z
);
scene.add(sphereGlow);
/* #endregion */


/* #region  lights */
const pointLight = new THREE.PointLight(0x86dfdf, 1.9);
pointLight.position.set(-3.3, 3, 6);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x0086ff, 2.4);
pointLight2.position.set(4.2, -12.6, 5);
scene.add(pointLight2);

const light = new THREE.DirectionalLight(0xffffff, 10.0);
light.position.set(-19, 11, -25);
light.target.position.set(0, 0, 0);
scene.add(light);
scene.add(light.target);
/* #endregion */


/* #region  circle with moon */
//circle
const moonCircle = new THREE.CircleGeometry(sphereParameters.radius + 2, 360);
const circle = new THREE.LineSegments(moonCircle, wireMaterial);
circle.position.set(sphereParameters.x, 0, sphereParameters.z);
circle.rotation.x = Math.PI * 0.5;

const moonPosition = {
    x: sphereParameters.x - sphereParameters.radius - 6,
    y: sphereParameters.y,
    z: sphereParameters.z,
};

const moonGeometry = new THREE.SphereGeometry(1, 30, 20);

//moon
const moonSolid = new THREE.Mesh(moonGeometry, sphereMaterial);
moonSolid.position.set(moonPosition.x, moonPosition.y, moonPosition.z);

//moon wire
const wireMoon = new THREE.WireframeGeometry(moonGeometry);
const moonLine = new THREE.LineSegments(wireMoon, wireMaterial);
moonLine.material.depthTest = true;
moonLine.material.opacity = 0.55;
moonLine.material.transparent = true;
moonLine.position.set(moonPosition.x, moonPosition.y, moonPosition.z);
moonLine
scene.add(circle);
circle.add(moonSolid);
circle.add(moonLine);

circle.rotation.z = THREE.MathUtils.degToRad(-45);
circle.rotation.x = THREE.MathUtils.degToRad(-76);
/* #endregion */


/* #region  animation */
let speed = 0.0005;

function animate() {
    requestAnimationFrame(animate);
    sphereSolid.rotation.y += speed;
    line.rotation.y += speed;

    if (group) group.rotation.y += speed;
    circle.rotation.z += 0.0018;
    moonSolid.rotation.y += 0.0028;
    moonLine.rotation.y += 0.0028;
    renderer.render(scene, camera);
    //composer.render(0.1);
}
animate();

function onWindowResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener('resize', onWindowResize, false);
/* #endregion */





/* #region  GUI */
if (debug) {
    dat.GUI.prototype.addThreeColor = function (obj, varName) {
        var dummy = {};
        dummy[varName] = obj[varName].getStyle();
        return this.addColor(dummy, varName).onChange(function (colorValue) {
            obj[varName].setStyle(colorValue);
        });
    };

    dat.GUI.prototype.addThreeUniformColor = function (
        material,
        uniformName,
        label
    ) {
        return this.addThreeColor(material.uniforms[uniformName], 'value').name(
            label || uniformName
        );
    };

    const gui = new dat.GUI();

    gui.add(circle.rotation, 'y')
        .step(0.1)
        .onChange((value) => {
            console.log(value);
            return THREE.MathUtils.degToRad(value);
        });
    gui.add(circle.rotation, 'x')
        .step(0.1)
        .onChange((value) => {
            console.log(value);
            return THREE.MathUtils.degToRad(value);
        });
    gui.add(circle.rotation, 'z')
        .step(0.1)
        .onChange((value) => {
            console.log(value);
            return THREE.MathUtils.degToRad(value);
        });

    gui.add(circle.position, 'x');
    gui.add(circle.position, 'y');
    gui.add(circle.position, 'z');

    gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
        bloomPass.threshold = Number(value);
    });

    gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
        bloomPass.strength = Number(value);
    });

    gui.add(params, 'bloomRadius', 0.0, 1.0)
        .step(0.01)
        .onChange(function (value) {
            bloomPass.radius = Number(value);
        });

    var lightGui = gui.addFolder('Light 1');
    lightGui.add(light.position, 'x');
    lightGui.add(light.position, 'y');
    lightGui.add(light.position, 'z');
    lightGui.add(light, 'intensity');
    lightGui.addThreeColor(light, 'color');

    var light2Gui = gui.addFolder('Light 2');
    light2Gui.add(pointLight.position, 'x');
    light2Gui.add(pointLight.position, 'y');
    light2Gui.add(pointLight.position, 'z');
    light2Gui.add(pointLight, 'intensity');
    light2Gui.addThreeColor(pointLight, 'color');

    var light3Gui = gui.addFolder('Light 3');
    light3Gui.add(pointLight2.position, 'x');
    light3Gui.add(pointLight2.position, 'y');
    light3Gui.add(pointLight2.position, 'z');
    light3Gui.add(pointLight2, 'intensity');
    light3Gui.addThreeColor(pointLight2, 'color');

    var ballGui = gui.addFolder('Ball controls');
    ballGui.addThreeColor(sphereMaterial, 'color');
    ballGui.add(sphereMaterial, 'roughness');
    ballGui.add(sphereMaterial, 'metalness');
    ballGui.add(sphereMaterial, 'opacity');
    ballGui.add(sphereMaterial, 'transparent', true);
}
/* #endregion */
