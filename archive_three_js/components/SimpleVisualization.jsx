import React, { useRef, useState, useEffect } from 'react';

const SimpleVisualization = () => {
  const mountRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // Skip on server-side rendering
    }

    // Only import Three.js on the client
    const THREE = require('three');
    
    try {
      console.log("Initializing simple Three.js scene");
      
      // Check if mountRef is available
      if (!mountRef.current) {
        throw new Error("Mount ref is not available");
      }
      
      // Get container dimensions
      const width = mountRef.current.clientWidth || 800;
      const height = 600;
      console.log("Container dimensions:", { width, height });
      
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f5ff);
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      mountRef.current.appendChild(renderer.domElement);
      
      // Add a simple cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 10, 10);
      scene.add(directionalLight);
      
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the cube
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        renderer.render(scene, camera);
      }
      
      animate();
      setLoading(false);
      
      // Cleanup on unmount
      return () => {
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        scene.clear();
      };
    } catch (err) {
      console.error("Error initializing Three.js:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return (
    <div className="visualization-container">
      <h2>Simple Three.js Visualization</h2>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Please check the browser console for more details.</p>
        </div>
      )}
      
      {loading && !error && (
        <div className="loading-message">
          <p>Loading visualization...</p>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="canvas-container"
      ></div>
      
      <style jsx>{`
        .visualization-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          position: relative;
        }
        
        .canvas-container {
          width: 100%;
          height: 600px;
          background: #f0f5ff;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .error-message {
          padding: 10px;
          margin-bottom: 15px;
          background: #ffebee;
          border: 1px solid #ffcdd2;
          border-radius: 4px;
          color: #d32f2f;
        }
        
        .loading-message {
          padding: 10px;
          margin-bottom: 15px;
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          border-radius: 4px;
          color: #1976d2;
        }
      `}</style>
    </div>
  );
};

export default SimpleVisualization;