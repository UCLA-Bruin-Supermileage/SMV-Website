import * as THREE from 'three';

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

    // Create a rotating cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x42069f });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.x = 0;  // left/right
    camera.position.y = 5;  // up/down
    camera.position.z = 5;  // forward/backward
    
    camera.rotation.x = -Math.PI / 6  // up/down  (angles in radians)
    camera.rotation.y = 0  // sides   (angles in radians)
    camera.rotation.z = 0  // roll   (angles in radians)

    // Animation function
    const animate = () => {
        requestAnimationFrame(animate);
        // cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
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