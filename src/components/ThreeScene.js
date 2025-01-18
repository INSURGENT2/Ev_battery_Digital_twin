import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Utility function to create a Sprite with text.
 * Disables its raycasting so these sprites don’t block mouse interactions.
 */
function createTextSprite(text, fontSize = 32, color = "#ffffff") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const padding = 10;
  ctx.font = `${fontSize}px sans-serif`;
  const textWidth = ctx.measureText(text).width;
  canvas.width = textWidth + padding * 2;
  canvas.height = fontSize + padding * 2;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.fillText(text, padding, fontSize + padding);
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    depthWrite: false,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.raycast = () => {}; // disable raycasting
  const baseScale = 0.01;
  sprite.scale.set(canvas.width * baseScale, canvas.height * baseScale, 1);
  return sprite;
}
/**
 * Utility function to create a card-like display for parameters.
 */
function createParameterPanel(title, stats, details, width = 300, height = 200, backgroundColor = "#0E1F2F", textColor = "#ffffff") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = textColor;
  ctx.fillText(title, 10, 30);

  // Stats
  ctx.font = "18px sans-serif";
  const statsLines = stats.split("\n");
  statsLines.forEach((line, index) => {
    ctx.fillText(line, 10, 60 + index * 20);
  });

  // Details
  ctx.font = "16px sans-serif";
  const detailsLines = details.split("\n");
  detailsLines.forEach((line, index) => {
    ctx.fillText(line, 10, 120 + index * 20);
  });

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width * 0.01, height * 0.01, 1); // Scale to fit the scene.
  return sprite;
}


/**
 * Define processes with models, names, summary stats, and extra details.
 */
const PROCESSES = [
  { 
    name: "Cell Preparation", 
    modelPath: "/models/cellPrep.gltf",
    stats: "Status: OK\nTemp: 70°C\nPass: 93%",
    details: "Vibration: 0.41\nEnergy: 52.85 kWh\nHumidity: 63%"
  },
  { 
    name: "Cell Stacking", 
    modelPath: "/models/cellStack.gltf",
    stats: "Status: Alert\nTemp: 68°C\nPass: 91%",
    details: "Vibration: 0.19\nEnergy: --\nHumidity: 58%"
  },
  { 
    name: "Welding Machine", 
    modelPath: "/models/weldingMachine.gltf",
    stats: "Status: Running\nTemp: 72°C\nPass: 98%",
    details: "Vibration: 0.54\nEnergy: 59.56 kWh\nHumidity: 44%"
  },
  { 
    name: "Thermal Installer", 
    modelPath: "/models/thermalInstaller.gltf",
    stats: "Status: OK\nTemp: 68°C\nPass: 93%",
    details: "Vibration: 0.58\nEnergy: 58.70 kWh\nHumidity: 46%"
  },
  { 
    name: "Frame Assembly", 
    modelPath: "/models/frameAssembly.gltf",
    stats: "Status: Offline\nTemp: 65°C\nPass: 98%",
    details: "Vibration: --\nEnergy: 37.08 kWh\nHumidity: 53%"
  },
  { 
    name: "Busbar Installer", 
    modelPath: "/models/busbarInstaller.gltf",
    stats: "Status: Running\nTemp: 66°C\nPass: 95%",
    details: "Vibration: 0.47\nEnergy: 59.06 kWh\nHumidity: 31%"
  },
  { 
    name: "Bms Installer", 
    modelPath: "/models/bmsInstaller.gltf",
    stats: "Status: OK\nTemp: 64°C\nPass: 90%",
    details: "Vibration: 0.56\nEnergy: 52.33 kWh\nHumidity: 40%"
  },
  { 
    name: "eol Testing", 
    modelPath: "/models/eolTest.gltf",
    stats: "Status: Testing\nTemp: 62°C\nPass: 97%",
    details: "Vibration: 0.73\nEnergy: 47.26 kWh\nHumidity: 61%"
  },
];

function ThreeScene() {
  const mountRef = useRef(null);

  
  useEffect(() => {
    // Create scene and camera.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x79ADDC);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 25);

    // Create renderer.
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // Create OrbitControls.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights.
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load("I:\College\Desktop\TATA\factory floor3.webp");
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10); // Adjust repeat to fit the scene scale.
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd3d3d3),
      roughness: 0.8,
    });
    
    
    
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the plane to make it horizontal.
    scene.add(floor);


    // GLTF Loader and positioning variables.
    const loader = new GLTFLoader();
    const spacing = 7; // you can try increasing this if needed
    const offset = { x: 4, z: 10 };
    // Add conveyor belt
    const conveyorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xD9DCD6), // Dark gray
      roughness: 0.8,
    });

    const conveyorWidth = 2; // Width of the conveyor
    const conveyorHeight = 0.5; // Thickness of the conveyor
    const conveyorLength = (PROCESSES.length - 1) * spacing; // Length based on spacing and number of processes

    const conveyorGeometry = new THREE.BoxGeometry(conveyorLength, conveyorHeight, conveyorWidth);
    const conveyor = new THREE.Mesh(conveyorGeometry, conveyorMaterial);

    // Position the conveyor belt between the machines
    conveyor.position.set(
      offset.x-28 + (conveyorLength / 2), // Center between the first and last machine
      conveyorHeight / 2, // Slightly above the floor
      offset.z-6
    );

    scene.add(conveyor);


    /**
     * For each process, load the model and add three labels.
     */
    
    PROCESSES.forEach((proc, index) => {
      const x = offset.x + index * spacing;
      const y = 0;
      const z = offset.z;
    
      loader.load(
        proc.modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(x, y, z);
          model.scale.set(0.2, 0.2, 0.2);
      
          // Traverse the model to change its material color.
          model.traverse((child) => {
            if (child.isMesh) {
              // Check if the mesh has a material.
              if (child.material) {
                child.material = child.material.clone(); // Clone material to avoid modifying shared materials.
                child.material.color.set(new THREE.Color(0xCED3DC)); // Change color to light blue.
              }
            }
          });
      
          scene.add(model);
      
          // Add parameter panel dynamically above the model based on its height.
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          box.getSize(size);
          const height = size.y;
      
          const parameterPanel = createParameterPanel(proc.name.toUpperCase(), proc.stats, proc.details);
          parameterPanel.position.set(x-28, y + 3, z-6);
          scene.add(parameterPanel);
        },
        undefined,
        (error) => {
          console.error(`Error loading ${proc.modelPath}:`, error);
        }
      );
      
    });
    
    // Animation loop.
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize.
    function onWindowResize() {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    }
    window.addEventListener("resize", onWindowResize);

    // Cleanup on unmount.
    return () => {
      window.removeEventListener("resize", onWindowResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "600px",
        background: "#000"
      }}
    />
  );
  
}

export default ThreeScene;