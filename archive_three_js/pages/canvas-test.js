import React, { useEffect } from 'react';
import Head from 'next/head';

// This page uses a direct <script> tag approach for Three.js
export default function CanvasTestPage() {
  useEffect(() => {
    // This code will only run on the client side
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.145.0/build/three.min.js';
    script.async = true;
    script.onload = initThreeJS;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
      const canvas = document.getElementById('three-canvas');
      if (canvas) {
        // Remove any existing canvas
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    };
  }, []);

  // Initialize Three.js after the script is loaded
  function initThreeJS() {
    if (typeof THREE === 'undefined') {
      console.error('THREE is not defined');
      return;
    }

    try {
      console.log('Initializing Three.js');
      const container = document.getElementById('canvas-container');
      
      // Clear container first
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x333333);

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      // Create renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.id = 'three-canvas';
      container.appendChild(renderer.domElement);

      // Create a cube
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }

      animate();
      console.log('Three.js initialized successfully');
    } catch (error) {
      console.error('Error initializing Three.js:', error);
      const container = document.getElementById('canvas-container');
      container.innerHTML = `<div class="error">Error initializing Three.js: ${error.message}</div>`;
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Canvas Three.js Test</title>
        <meta name="description" content="Testing Three.js with direct canvas approach" />
      </Head>

      <main>
        <h1>Canvas Three.js Test</h1>
        <p>This page tests if Three.js works with a direct canvas approach.</p>

        <div 
          id="canvas-container" 
          style={{
            width: '100%',
            height: '400px',
            backgroundColor: '#222',
            marginTop: '20px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px'
          }}
        >
          <div className="loading">Loading Three.js...</div>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 2rem;
          background-color: #f0f0f0;
        }
        
        main {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 16px;
        }
        
        .error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ff4444;
          background-color: rgba(0,0,0,0.7);
          padding: 10px 20px;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}