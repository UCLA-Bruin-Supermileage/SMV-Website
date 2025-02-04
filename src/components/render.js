import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

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
    mountRef.current.appendChild(renderer.domElement);
    var carModel;

    // light sources
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    var lightTop = new THREE.PointLight(0xffffff, 75, 0);
    lightTop.position.set(5, 5, 5);
    scene.add(lightTop)

    // Create a rotating cube
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshPhongMaterial({
    //     color: 0x69f420 ,
    //     shininess: 100,
    //     specular: 0xffffff
    //     });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    const loader = new OBJLoader();
    loader.load('./models/Aeroshell_16.obj', (object) => {
        object.scale.set(0.001, 0.001, 0.001); // Adjust scale if necessary
        object.position.set(0, 0, 0); // Adjust position if needed
        scene.add(object);
        carModel = object;
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

    // Animation function
    const animate = () => {
        requestAnimationFrame(animate);
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        if (carModel) {
            carModel.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
        renderer.dispose();
    };
}

export default function initializeScene(mountRef) {
    return generateScene(mountRef);
}