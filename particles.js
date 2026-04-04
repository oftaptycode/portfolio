// Hero Particle Simulation
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, composer;
let particleLayers = [];
let time = 0;
const mouse = new THREE.Vector3(0, 0, 0);
const targetMouse = new THREE.Vector3(0, 0, 0);
const mouseRadius = 20;
let ripples = [];

const layersConfig = [
    {
        count: 20000,
        size: 0.3,
        colorRange: { hue: [0.75, 0.9], sat: [0.7, 1], light: [0.5, 0.7] },
        rotationSpeed: 0.001
    },
    {
        count: 25000,
        size: 0.2,
        colorRange: { hue: [0.45, 0.6], sat: [0.6, 0.8], light: [0.4, 0.6] },
        rotationSpeed: 0.0005
    }
];

function createParticleSystem(config) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.count * 3);
    const colors = new Float32Array(config.count * 3);
    const basePositions = new Float32Array(config.count * 3);
    const baseColors = new Float32Array(config.count * 3);

    for (let i = 0; i < config.count; i++) {
        const i3 = i * 3;

        const radius = 10 + Math.random() * 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        basePositions[i3] = x;
        basePositions[i3 + 1] = y;
        basePositions[i3 + 2] = z;

        const dist = Math.sqrt(x * x + y * y + z * z) / 110;
        const hue = THREE.MathUtils.lerp(config.colorRange.hue[0], config.colorRange.hue[1], dist);
        const sat = THREE.MathUtils.lerp(config.colorRange.sat[0], config.colorRange.sat[1], dist);
        const light = THREE.MathUtils.lerp(config.colorRange.light[0], config.colorRange.light[1], dist);

        const color = new THREE.Color().setHSL(hue, sat, light);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        baseColors[i3] = color.r;
        baseColors[i3 + 1] = color.g;
        baseColors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load('https://placehold.co/32x32/ffffff/ffffff.png?text=+');

    const material = new THREE.PointsMaterial({
        size: config.size,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        map: particleTexture
    });

    const points = new THREE.Points(geometry, material);
    points.userData = {
        velocities: new Float32Array(config.count * 3),
        basePositions,
        baseColors,
        colorVelocities: new Float32Array(config.count * 3),
        rotationSpeed: config.rotationSpeed
    };

    return points;
}

function createRipple(x, y) {
    ripples.push({
        x, y,
        radius: 0,
        strength: 2.5,
        maxRadius: mouseRadius * 4,
        speed: 4,
        color: new THREE.Color(0xffffff)
    });
}

function init() {
    const container = document.getElementById('particle-container');
    if (!container) return;

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020108, 0.008);

    camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.setClearColor(0x020108);
    container.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    layersConfig.forEach(config => {
        const particles = createParticleSystem(config);
        particleLayers.push(particles);
        scene.add(particles);
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    window.addEventListener('resize', onWindowResize);
}

function updateParticles() {
    mouse.lerp(targetMouse, 0.05);

    ripples = ripples.filter(ripple => {
        ripple.radius += ripple.speed;
        ripple.strength *= 0.96;
        return ripple.radius < ripple.maxRadius;
    });

    particleLayers.forEach(layer => {
        const positions = layer.geometry.attributes.position.array;
        const colors = layer.geometry.attributes.color.array;
        const { velocities, basePositions, baseColors, colorVelocities } = layer.userData;
        const totalParticles = positions.length / 3;

        for (let i = 0; i < totalParticles; i++) {
            const i3 = i * 3;
            const px = positions[i3];
            const py = positions[i3 + 1];
            const pz = positions[i3 + 2];

            let totalForce = new THREE.Vector3();
            let colorShift = new THREE.Vector3();

            const mouseDist = mouse.distanceTo(new THREE.Vector3(px, py, pz));
            if (mouseDist < mouseRadius) {
                const forceStrength = (1 - mouseDist / mouseRadius) * 0.1;
                const forceDirection = new THREE.Vector3(px, py, pz).sub(mouse).normalize();
                totalForce.add(forceDirection.multiplyScalar(forceStrength));

                const colorIntensity = (1 - mouseDist / mouseRadius) * 0.8;
                colorShift.set(colorIntensity, colorIntensity, colorIntensity);
            }

            ripples.forEach(ripple => {
                const rippleDist = Math.sqrt(Math.pow(ripple.x - px, 2) + Math.pow(ripple.y - py, 2));
                const rippleWidth = 15;
                if (Math.abs(rippleDist - ripple.radius) < rippleWidth) {
                    const falloff = 1 - Math.abs(rippleDist - ripple.radius) / rippleWidth;
                    const rippleForce = ripple.strength * falloff * 0.1;
                    const forceDirection = new THREE.Vector3(px, py, pz).sub(new THREE.Vector3(ripple.x, ripple.y, pz)).normalize();
                    totalForce.add(forceDirection.multiplyScalar(rippleForce));

                    const rippleColor = new THREE.Vector3(ripple.color.r, ripple.color.g, ripple.color.b);
                    colorShift.add(rippleColor.multiplyScalar(falloff * ripple.strength));
                }
            });

            velocities[i3] += totalForce.x;
            velocities[i3 + 1] += totalForce.y;
            velocities[i3 + 2] += totalForce.z;

            const returnForce = 0.02;
            velocities[i3] += (basePositions[i3] - px) * returnForce;
            velocities[i3 + 1] += (basePositions[i3 + 1] - py) * returnForce;
            velocities[i3 + 2] += (basePositions[i3 + 2] - pz) * returnForce;

            const damping = 0.94;
            velocities[i3] *= damping;
            velocities[i3 + 1] *= damping;
            velocities[i3 + 2] *= damping;

            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            colorVelocities[i3] += colorShift.x;
            colorVelocities[i3 + 1] += colorShift.y;
            colorVelocities[i3 + 2] += colorShift.z;

            const colorReturnForce = 0.05;
            colorVelocities[i3] += (baseColors[i3] - colors[i3]) * colorReturnForce;
            colorVelocities[i3 + 1] += (baseColors[i3 + 1] - colors[i3 + 1]) * colorReturnForce;
            colorVelocities[i3 + 2] += (baseColors[i3 + 2] - colors[i3 + 2]) * colorReturnForce;

            const colorDamping = 0.9;
            colorVelocities[i3] *= colorDamping;
            colorVelocities[i3 + 1] *= colorDamping;
            colorVelocities[i3 + 2] *= colorDamping;

            colors[i3] += colorVelocities[i3];
            colors[i3 + 1] += colorVelocities[i3 + 1];
            colors[i3 + 2] += colorVelocities[i3 + 2];
        }

        layer.geometry.attributes.position.needsUpdate = true;
        layer.geometry.attributes.color.needsUpdate = true;
    });
}

function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    updateParticles();

    particleLayers.forEach(layer => {
        layer.rotation.y += layer.userData.rotationSpeed;
        layer.rotation.x = Math.sin(time * 0.1) * 0.05;
    });

    camera.position.x = Math.sin(time * 0.2) * 2;
    camera.position.y = Math.cos(time * 0.3) * 2;
    camera.lookAt(scene.position);

    composer.render();
}

function getNormalizedMouse(event) {
    const container = document.getElementById('particle-container');
    const rect = container.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / rect.width * 2 - 1,
        y: -(event.clientY - rect.top) / rect.height * 2 + 1
    };
}

function onMouseMove(event) {
    const m = getNormalizedMouse(event);
    targetMouse.x = m.x;
    targetMouse.y = m.y;

    const vector = new THREE.Vector3(targetMouse.x, targetMouse.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    targetMouse.copy(pos);
}

function onClick(event) {
    const m = getNormalizedMouse(event);
    const vector = new THREE.Vector3(m.x, m.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    createRipple(pos.x, pos.y);
}

function onWindowResize() {
    const container = document.getElementById('particle-container');
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
}

init();
animate();