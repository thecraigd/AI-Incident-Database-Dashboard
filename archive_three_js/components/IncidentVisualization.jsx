import React, { useEffect, useRef, useState, useMemo } from 'react';

const IncidentVisualization = ({ incidents, statistics }) => {
  const containerRef = useRef(null);
  const [vizType, setVizType] = useState('network');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Set up the visualization scene and controls
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    
    setLoading(true);
    console.log(`Initializing ${vizType} visualization`);
    
    let renderer, scene, camera;
    let frameId = null;
    let controls;
    
    // Import Three.js dynamically
    import('three').then(async THREE => {
      try {
        console.log("Three.js loaded successfully");
        
        // Get container dimensions
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 600;
        
        // Initialize renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0xf0f5ff);
        
        // Clear container and add canvas
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.appendChild(renderer.domElement);
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f5ff);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 25;
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10);
        scene.add(directionalLight);
        
        // Add OrbitControls
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        
        // Build the visualization based on type
        buildVisualization(THREE, scene, vizType, incidents);
        
        // Animation function
        const animate = () => {
          controls.update();
          renderer.render(scene, camera);
          frameId = requestAnimationFrame(animate);
        };
        
        // Start animation
        animate();
        
        // Handle window resize
        const handleResize = () => {
          if (!containerRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight || 600;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        setLoading(false);
        console.log(`${vizType} visualization setup complete`);
      } catch (err) {
        console.error(`Error in ${vizType} visualization:`, err);
        setError(err.message);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Error loading Three.js:", err);
      setError("Failed to load Three.js library");
      setLoading(false);
    });
    
    // Cleanup
    return () => {
      console.log(`Cleaning up ${vizType} visualization`);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      if (renderer) {
        renderer.dispose();
      }
      if (controls) {
        controls.dispose();
      }
      window.removeEventListener('resize', () => {});
    };
  }, [vizType, incidents]);
  
  // Function to build different visualization types
  const buildVisualization = (THREE, scene, type, incidents) => {
    // Clear existing objects (except lights)
    scene.children.forEach(child => {
      if (child.type !== 'AmbientLight' && child.type !== 'DirectionalLight') {
        scene.remove(child);
      }
    });
    
    // Color palettes
    const typeColors = [
      0xFF5733, 0x33FF57, 0x3357FF, 0xF033FF, 0xFFFF33, 
      0x33FFFF, 0xFF33A1, 0xA133FF, 0x33FFA1
    ];
    
    const severityColors = {
      'Low': 0x00FF00,
      'Medium': 0xFFFF00,
      'High': 0xFF9900,
      'Critical': 0xFF0000
    };
    
    // Process the incidents to add type and severity information
    const processedIncidents = processIncidents(incidents);
    
    // Always add a test sphere so we know rendering is working
    const testGeometry = new THREE.SphereGeometry(1, 32, 32);
    const testMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      emissive: 0x440000,
      specular: 0xffffff,
      shininess: 30
    });
    const testSphere = new THREE.Mesh(testGeometry, testMaterial);
    testSphere.position.set(-20, 15, 0);
    scene.add(testSphere);
    
    if (type === 'network') {
      createNetworkViz(THREE, scene, processedIncidents, typeColors, severityColors);
    } else if (type === 'timeline') {
      createTimelineViz(THREE, scene, processedIncidents, typeColors);
    } else if (type === 'severity') {
      createSeverityViz(THREE, scene, processedIncidents, typeColors, severityColors);
    } else if (type === 'entity') {
      createEntityViz(THREE, scene, processedIncidents, typeColors);
    }
  };
  
  // Process incidents to add type and severity
  const processIncidents = (incidents) => {
    if (!incidents) return [];
    
    const incidentTypes = [
      'Bias/Discrimination', 
      'Privacy Violation', 
      'Misinformation',
      'Performance Failure', 
      'Security Vulnerability', 
      'Autonomous System Failure',
      'Transparency Issue', 
      'Unexpected Behavior', 
      'Content Moderation Failure'
    ];
    
    return incidents.map(incident => {
      // Determine type based on description
      let typeIndex = 0;
      const desc = incident.description?.toLowerCase() || '';
      
      if (desc.includes('bias') || desc.includes('discriminat') || desc.includes('fairness')) {
        typeIndex = 0; // Bias/Discrimination
      } else if (desc.includes('privacy') || desc.includes('data leak') || desc.includes('personal data')) {
        typeIndex = 1; // Privacy Violation
      } else if (desc.includes('misinformation') || desc.includes('fake') || desc.includes('false')) {
        typeIndex = 2; // Misinformation
      } else if (desc.includes('fail') || desc.includes('error') || desc.includes('malfunction')) {
        typeIndex = 3; // Performance Failure
      } else if (desc.includes('security') || desc.includes('hack') || desc.includes('vulnerability')) {
        typeIndex = 4; // Security Vulnerability
      } else if (desc.includes('autonomous') || desc.includes('self-driving') || desc.includes('robot')) {
        typeIndex = 5; // Autonomous System Failure
      } else if (desc.includes('transparency') || desc.includes('unclear') || desc.includes('opaque')) {
        typeIndex = 6; // Transparency Issue
      } else if (desc.includes('unexpected') || desc.includes('surprise') || desc.includes('unforeseen')) {
        typeIndex = 7; // Unexpected Behavior
      } else if (desc.includes('content') || desc.includes('moderation') || desc.includes('filter')) {
        typeIndex = 8; // Content Moderation Failure
      } else {
        // Default to a random type if no keywords match
        typeIndex = Math.floor(Math.random() * incidentTypes.length);
      }
      
      // Estimate severity based on harmed parties
      const severityIndex = incident.harmedParties?.length > 2 ? 3 : 
                           incident.harmedParties?.length > 1 ? 2 : 
                           incident.harmedParties?.length > 0 ? 1 : 0;
      
      const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
      
      return {
        ...incident,
        type: incidentTypes[typeIndex],
        typeIndex,
        severity: severityLevels[severityIndex],
        severityIndex,
        year: new Date(incident.date).getFullYear()
      };
    });
  };
  
  // Network visualization
  const createNetworkViz = (THREE, scene, incidents, typeColors, severityColors) => {
    // Create a node for each incident
    incidents.slice(0, 150).forEach((incident, index) => { // Limit to 150 incidents for performance
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: severityColors[incident.severity] || 0xffffff,
        transparent: true,
        opacity: 0.7
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      // Position randomly in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 10 + Math.random() * 5;
      sphere.position.x = r * Math.sin(phi) * Math.cos(theta);
      sphere.position.y = r * Math.sin(phi) * Math.sin(theta);
      sphere.position.z = r * Math.cos(phi);
      
      sphere.userData = { incident };
      
      scene.add(sphere);
    });
    
    // Get unique types
    const uniqueTypes = [...new Set(incidents.map(i => i.type))];
    
    // Create nodes for each type
    uniqueTypes.forEach((type, index) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ 
        color: typeColors[index % typeColors.length],
        transparent: false
      });
      const cube = new THREE.Mesh(geometry, material);
      
      // Position in a circle
      const angle = (index / uniqueTypes.length) * Math.PI * 2;
      const r = 15;
      cube.position.x = r * Math.cos(angle);
      cube.position.y = r * Math.sin(angle);
      cube.position.z = 0;
      
      // Add a text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '16px Arial';
      context.fillStyle = '#000000';
      context.textAlign = 'center';
      context.fillText(type, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const labelGeometry = new THREE.PlaneGeometry(4, 1);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.x = cube.position.x * 1.2;
      label.position.y = cube.position.y * 1.2;
      label.position.z = cube.position.z;
      label.lookAt(0, 0, 0);
      
      cube.userData = { type };
      
      scene.add(cube);
      scene.add(label);
    });
  };
  
  // Timeline visualization
  const createTimelineViz = (THREE, scene, incidents, typeColors) => {
    // Group incidents by year
    const incidentsByYear = {};
    incidents.forEach(incident => {
      const year = incident.year || 2020; // Default to 2020 if year is missing
      if (!incidentsByYear[year]) {
        incidentsByYear[year] = [];
      }
      incidentsByYear[year].push(incident);
    });
    
    const years = Object.keys(incidentsByYear).sort();
    
    // Create visualization for each year
    years.forEach((year, yearIndex) => {
      const yearIncidents = incidentsByYear[year];
      
      // Create a text label for the year
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '24px Arial';
      context.fillStyle = '#000000';
      context.textAlign = 'center';
      context.fillText(year, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const geometry = new THREE.PlaneGeometry(3, 1.5);
      const yearLabel = new THREE.Mesh(geometry, material);
      yearLabel.position.x = (yearIndex - years.length / 2) * 8;
      yearLabel.position.y = -8;
      yearLabel.position.z = 0;
      
      scene.add(yearLabel);
      
      // Create a cylinder for each year
      const yearGeometry = new THREE.CylinderGeometry(3, 3, 10, 32);
      const yearMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888, 
        transparent: true,
        opacity: 0.1
      });
      const yearCylinder = new THREE.Mesh(yearGeometry, yearMaterial);
      yearCylinder.position.x = (yearIndex - years.length / 2) * 8;
      yearCylinder.position.y = 0;
      yearCylinder.position.z = 0;
      
      scene.add(yearCylinder);
      
      // Position incidents in a spiral around the cylinder
      yearIncidents.slice(0, 100).forEach((incident, index) => { // Limit to 100 per year
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
          color: typeColors[incident.typeIndex % typeColors.length] || 0xffffff
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        // Arrange in a spiral
        const angle = (index / yearIncidents.length) * Math.PI * 4;
        const height = (index / yearIncidents.length) * 8 - 4;
        
        sphere.position.x = (yearIndex - years.length / 2) * 8 + Math.cos(angle) * 3;
        sphere.position.y = height;
        sphere.position.z = Math.sin(angle) * 3;
        
        sphere.userData = { incident };
        
        scene.add(sphere);
      });
    });
  };
  
  // Severity visualization
  const createSeverityViz = (THREE, scene, incidents, typeColors, severityColors) => {
    const severityLevels = ['Critical', 'High', 'Medium', 'Low'];
    const ringRadius = [4, 8, 12, 16];
    
    // Create rings for each severity level
    severityLevels.forEach((severity, severityIndex) => {
      const severityIncidents = incidents.filter(i => i.severity === severity);
      
      // Create ring
      const ringGeometry = new THREE.TorusGeometry(ringRadius[severityIndex], 0.1, 16, 100);
      const ringMaterial = new THREE.MeshPhongMaterial({ 
        color: severityColors[severity] || 0xffffff,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      
      scene.add(ring);
      
      // Add text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 128;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '24px Arial';
      context.fillStyle = '#000000';
      context.textAlign = 'center';
      context.fillText(severity, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const geometry = new THREE.PlaneGeometry(3, 1.5);
      const severityLabel = new THREE.Mesh(geometry, material);
      severityLabel.position.x = ringRadius[severityIndex] * 1.2;
      severityLabel.position.y = 0.5;
      severityLabel.position.z = 0;
      
      scene.add(severityLabel);
      
      // Add incident dots
      severityIncidents.slice(0, 200).forEach((incident, index) => { // Limit to 200 per level
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
          color: typeColors[incident.typeIndex % typeColors.length] || 0xffffff
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        // Position around the ring
        const angle = (index / severityIncidents.length) * Math.PI * 2;
        sphere.position.x = Math.cos(angle) * ringRadius[severityIndex];
        sphere.position.y = 0;
        sphere.position.z = Math.sin(angle) * ringRadius[severityIndex];
        
        sphere.userData = { incident };
        
        scene.add(sphere);
      });
    });
  };
  
  // Entity visualization
  const createEntityViz = (THREE, scene, incidents, typeColors) => {
    // Extract entities
    const entities = new Set();
    incidents.forEach(incident => {
      if (incident.developer) {
        incident.developer.forEach(d => entities.add(d));
      }
      if (incident.deployer) {
        incident.deployer.forEach(d => entities.add(d));
      }
    });
    
    // Count incidents per entity
    const entityCounts = {};
    Array.from(entities).forEach(entity => {
      const count = incidents.filter(incident => 
        (incident.developer && incident.developer.includes(entity)) || 
        (incident.deployer && incident.deployer.includes(entity))
      ).length;
      entityCounts[entity] = count;
    });
    
    // Get top 10 entities by incident count
    const topEntities = Object.keys(entityCounts)
      .filter(entity => entity && entity.length > 0)
      .sort((a, b) => entityCounts[b] - entityCounts[a])
      .slice(0, 10);
    
    // Create a visualization for each top entity
    topEntities.forEach((entity, index) => {
      const relatedIncidents = incidents.filter(incident => 
        (incident.developer && incident.developer.includes(entity)) || 
        (incident.deployer && incident.deployer.includes(entity))
      );
      
      // Position in a circle
      const angle = (index / topEntities.length) * Math.PI * 2;
      const r = 15;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      
      // Create entity cube
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const material = new THREE.MeshPhongMaterial({ 
        color: typeColors[index % typeColors.length] || 0xffffff
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, 0, z);
      
      scene.add(cube);
      
      // Add entity label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = '16px Arial';
      context.fillStyle = '#000000';
      context.textAlign = 'center';
      context.fillText(`${entity} (${relatedIncidents.length})`, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const labelGeometry = new THREE.PlaneGeometry(4, 1);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(x * 1.2, 2, z * 1.2);
      label.lookAt(0, 2, 0);
      
      scene.add(label);
      
      // Create incident spheres
      relatedIncidents.slice(0, 50).forEach((incident, incidentIndex) => { // Limit to 50 per entity
        const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const sphereMaterial = new THREE.MeshPhongMaterial({ 
          color: typeColors[incident.typeIndex % typeColors.length] || 0xffffff
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        // Position in a small circle around the entity
        const incidentAngle = (incidentIndex / relatedIncidents.length) * Math.PI * 2;
        const smallR = 3;
        sphere.position.x = x + Math.cos(incidentAngle) * smallR;
        sphere.position.y = Math.sin(incidentAngle) * 2; // Some vertical distribution
        sphere.position.z = z + Math.sin(incidentAngle) * smallR;
        
        sphere.userData = { incident };
        
        scene.add(sphere);
      });
    });
  };
  
  // Handle visualization type change
  const handleVizChange = (type) => {
    console.log(`Changing visualization type to: ${type}`);
    setVizType(type);
  };
  
  // Render incident details when one is selected
  const renderIncidentDetails = () => {
    if (!selectedIncident) return null;
    
    return (
      <div className="incident-details">
        <h3>{selectedIncident.title}</h3>
        <p><strong>Date:</strong> {selectedIncident.date}</p>
        <p><strong>ID:</strong> {selectedIncident.id}</p>
        <p><strong>Type:</strong> {selectedIncident.type}</p>
        <p><strong>Severity:</strong> {selectedIncident.severity}</p>
        <div className="incident-description">
          <p>{selectedIncident.description}</p>
        </div>
        {selectedIncident.deployer?.length > 0 && (
          <p><strong>Deployer:</strong> {selectedIncident.deployer.join(", ")}</p>
        )}
        {selectedIncident.developer?.length > 0 && (
          <p><strong>Developer:</strong> {selectedIncident.developer.join(", ")}</p>
        )}
        {selectedIncident.harmedParties?.length > 0 && (
          <p><strong>Harmed Parties:</strong> {selectedIncident.harmedParties.join(", ")}</p>
        )}
        <button onClick={() => setSelectedIncident(null)}>Close</button>
      </div>
    );
  };
  
  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button 
          onClick={() => handleVizChange('network')}
          className={vizType === 'network' ? 'active' : ''}
          disabled={loading}
        >
          Network View
        </button>
        <button 
          onClick={() => handleVizChange('timeline')}
          className={vizType === 'timeline' ? 'active' : ''}
          disabled={loading}
        >
          Timeline View
        </button>
        <button 
          onClick={() => handleVizChange('severity')}
          className={vizType === 'severity' ? 'active' : ''}
          disabled={loading}
        >
          Severity View
        </button>
        <button 
          onClick={() => handleVizChange('entity')}
          className={vizType === 'entity' ? 'active' : ''}
          disabled={loading}
        >
          Entity View
        </button>
      </div>
      
      <div className="viz-description">
        {vizType === 'network' && (
          <p>Network view shows connections between incidents and their types. Drag to rotate, scroll to zoom.</p>
        )}
        {vizType === 'timeline' && (
          <p>Timeline view organizes incidents by year. Incidents are color-coded by type.</p>
        )}
        {vizType === 'severity' && (
          <p>Severity view arranges incidents in concentric rings by severity level from Critical (center) to Low (outer).</p>
        )}
        {vizType === 'entity' && (
          <p>Entity view shows relationships between major entities (companies/organizations) and incidents.</p>
        )}
      </div>
      
      <div className="visualization-wrapper">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading visualization...</p>
          </div>
        )}
        
        {error && (
          <div className="error-overlay">
            <p>Failed to load visualization: {error}</p>
            <p>Please check the browser console for more details.</p>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className="canvas-container"
        ></div>
      </div>
      
      {selectedIncident && renderIncidentDetails()}
      
      <style jsx>{`
        .visualization-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
          position: relative;
        }
        
        .viz-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .viz-controls button {
          padding: 10px 20px;
          background: #f0f0f0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .viz-controls button:hover:not(:disabled) {
          background: #e0e0e0;
        }
        
        .viz-controls button.active {
          background: #3b82f6;
          color: white;
        }
        
        .viz-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .viz-description {
          margin-bottom: 15px;
          font-style: italic;
          color: #666;
        }
        
        .visualization-wrapper {
          position: relative;
          height: 600px;
          background: #f0f5ff;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .canvas-container {
          width: 100%;
          height: 100%;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        
        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 232, 232, 0.9);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
          color: #d32f2f;
          text-align: center;
          padding: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .incident-details {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          padding: 20px;
          max-width: 80%;
          max-height: 80%;
          overflow-y: auto;
          z-index: 30;
        }
        
        .incident-details h3 {
          margin-top: 0;
          color: #333;
        }
        
        .incident-description {
          margin: 15px 0;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        
        .incident-details button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }
        
        .incident-details button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default IncidentVisualization;