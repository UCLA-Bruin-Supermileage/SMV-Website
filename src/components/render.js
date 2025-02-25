import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

const ALLOW_FREE_MOVE = true;
const RENDER_TEST_CUBE = false;

function generateScene(mountRef) {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    var carModel;

    // light sources
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    var lightTop = new THREE.PointLight(0xffffff, 75, 0);
    lightTop.position.set(5, 5, 5);
    scene.add(lightTop)

    const loader = new OBJLoader();
    loader.load('./models/Aeroshell_16.obj', (object) => {
        object.scale.set(0.001, 0.001, 0.001); // Adjust scale if necessary
        object.position.set(0, 0, 0); // Adjust position if needed
        scene.add(object);
        carModel = object;
        carModel.matrixAutoUpdate = false;
    }, undefined, (error) => {
        console.error('Error loading model:', error);
    });
    
    // camera parameters
    camera.position.x = 0;  // left/right
    camera.position.y = 5;  // up/down
    camera.position.z = 8;  // forward/backward
    
    camera.rotation.x = -Math.PI / 6  // up/down  (angles in radians)
    camera.rotation.y = 0  // sides   (angles in radians)
    camera.rotation.z = 0  // roll   (angles in radians)
    
    // camera functions (only used if ALLOW_FREE_MOVE)
    const cameraSpeed = 0.1
    const keys = {w: false, a: false, s: false, d: false, space: false, shift: false};

    let yaw = 0, pitch = 0;
    let isPointerLocked = false;

    if (ALLOW_FREE_MOVE) {
        document.addEventListener("keydown", (event) => {
            if (event.code === "KeyW") keys.w = true;
            if (event.code === "KeyA") keys.a = true;
            if (event.code === "KeyS") keys.s = true;
            if (event.code === "KeyD") keys.d = true;
            if (event.code === "Space") keys.space = true;
            if (event.code === "ShiftLeft") keys.shift = true;
        });
    
        document.addEventListener("keyup", (event) => {
            if (event.code === "KeyW") keys.w = false;
            if (event.code === "KeyA") keys.a = false;
            if (event.code === "KeyS") keys.s = false;
            if (event.code === "KeyD") keys.d = false;
            if (event.code === "Space") keys.space = false;
            if (event.code === "ShiftLeft") keys.shift = false;
        });
    
        document.addEventListener("mousemove", (event) => {
            if (isPointerLocked) {
                const sensitivity = 0.002;
                yaw -= event.movementX * sensitivity;
                pitch -= event.movementY * sensitivity;
                pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch
                updateCameraRotation();
            }
        });
    
        // Pointer lock setup
        document.addEventListener("click", () => {
            document.body.requestPointerLock();
        });
    
        document.addEventListener("pointerlockchange", () => {
            isPointerLocked = document.pointerLockElement === document.body;
        });
    }
    
    function updateCameraRotation() {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')); // Order: Yaw (Y), Pitch (X)
        camera.quaternion.copy(quaternion);
    }

    function updateMovement() {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0; // Prevent vertical tilt affecting movement
        direction.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize(); // Ensures right is horizontal

        if (keys.w) camera.position.addScaledVector(direction, cameraSpeed);
        if (keys.s) camera.position.addScaledVector(direction, -cameraSpeed);
        if (keys.a) camera.position.addScaledVector(right, cameraSpeed);
        if (keys.d) camera.position.addScaledVector(right, -cameraSpeed);
        if (keys.space) camera.position.y += cameraSpeed;
        if (keys.shift) camera.position.y -= cameraSpeed;
    }    
    
    // test cube (renders a cube at the origin with -1 < x, y, z < 1)
    if (RENDER_TEST_CUBE) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }
    
    // Animation function
    let time = 0;
    let lastFrameTime = performance.now();

    const animate = () => {
        requestAnimationFrame(animate);
        updateMovement();  // update camera position and rotation

        const curTime = performance.now();
        const deltaTime = (curTime - lastFrameTime) / 1000;
        lastFrameTime = curTime;

        time += deltaTime;

        if (carModel) {
            var matrix = new THREE.Matrix4();
            console.log(matrix)
            const translation_base = new THREE.Matrix4().makeTranslation(-0.6, 0, -1.5);  // base: moves center of car to origin
            const translation_O = new THREE.Matrix4().makeTranslation(-0.6, 0, -1.5);  // move center to origin
            const rotation = new THREE.Matrix4().makeRotationY(time);  // rotate the car
            const translation_I = new THREE.Matrix4().makeTranslation(0.6, 0, 1.5);  // inverse of translation_O
            matrix.premultiply(translation_O);
            matrix.premultiply(rotation);  
            matrix.premultiply(translation_I);
            matrix.premultiply(translation_base);

            matrix.multiplyMatrices(matrix, new THREE.Matrix4().makeScale(0.001, 0.001, 0.001));
            carModel.matrix.copy(matrix);
            // carModel.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
    };
    animate();

    // handle resizing
    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Cleanup function
    return () => {
        renderer.dispose();
    };
}

export default function initializeScene(mountRef) {
    return generateScene(mountRef);
}