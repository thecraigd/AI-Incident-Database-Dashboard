import React, { useEffect, useRef, useState } from 'react';

const MinimalViz = () => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    
    console.log("MinimalViz initializing");
    
    let renderer, scene, camera, cube;
    let frameId = null;
    
    // Import Three.js dynamically
    import('three').then(THREE => {
      try {
        console.log("Three.js loaded successfully");
        
        // Get container dimensions
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 400;
        
        // Initialize renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x444444);
        
        // Clear container and add canvas
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(renderer.domElement);
        
        // Create scene
        scene = new THREE.Scene();
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;
        
        // Create a cube
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({
          color: 0xff5500,
          wireframe: true
        });
        
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        
        // Animation function
        const animate = () => {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
          
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
        
        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight || 400;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        console.log("MinimalViz setup complete");
      } catch (err) {
        console.error("Error in MinimalViz:", err);
        setError(err.message);
      }
    }).catch(err => {
      console.error("Error loading Three.js:", err);
      setError("Failed to load Three.js library");
    });
    
    // Cleanup
    return () => {
      console.log("MinimalViz cleaning up");
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (renderer) {
        renderer.dispose();
      }
      window.removeEventListener('resize', () => {});
    };
  }, []);
  
  return (
    <div className="minimal-viz-container">
      {error && (
        <div className="error-message">Error: {error}</div>
      )}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '400px', 
          backgroundColor: '#222222',
          border: '1px solid #444444',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      />
      <style jsx>{`
        .minimal-viz-container {
          margin-bottom: 20px;
        }
        .error-message {
          padding: 10px;
          margin-bottom: 10px;
          background-color: #ffebee;
          color: #d32f2f;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default MinimalViz;