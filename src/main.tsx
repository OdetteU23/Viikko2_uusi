import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import ReactDOM from "react-dom/client";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


function ThreeSceneApp() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Ambient light 
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // PMREM Generator 
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Environment map loader
    new RGBELoader().load(`${import.meta.env.BASE_URL}textures/river_alcove.hdr`, (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = envMap; 
      texture.dispose();
      pmremGenerator.dispose();
    });

    const loader = new GLTFLoader();
    
    // Load Wolf model 
    loader.load(
      `${import.meta.env.BASE_URL}models/wolf/Wolf-Blender-2.82a.glb`,
      (gltf) => {
        const wolf = gltf.scene;
        wolf.position.set(0, 0, 0);
        wolf.scale.set(1, 1, 1); 
        scene.add(wolf);
        console.log('Wolf model loaded successfully!');
      },
      (xhr) => {
        console.log('Wolf: ' + (xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("Error loading Wolf model:", error);
      }
    );

    // the DamagedHelmet model which includes comprehensive PBR texturing
    loader.load(
      `${import.meta.env.BASE_URL}models/DamagedHelmet.gltf`,
      (gltf) => {
        const helmet = gltf.scene;
        helmet.position.set(2, 0, 0);
        helmet.scale.set(1.5, 1.5, 1.5);
        scene.add(helmet);
        console.log('Helmet model with PBR textures loaded successfully!');
      },
      (xhr) => {
        console.log('Helmet: ' + (xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("Error loading Helmet model:", error);
      }
    );

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return React.createElement('div', { ref: mountRef });
}

const appElement = document.getElementById("app");
if (appElement) {
  ReactDOM.createRoot(appElement).render(React.createElement(ThreeSceneApp));
}