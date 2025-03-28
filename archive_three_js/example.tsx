import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import _ from 'lodash';

const AISafety3DVisualization = () => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [vizType, setVizType] = useState('network');

  useEffect(() => {
    // Scene setup
    const width = mountRef.current.clientWidth;
    const height = 600;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f5ff);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 25;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Manual camera rotation controls instead of OrbitControls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRotation = { x: 0, y: 0 };
    let cameraDistance = 25; // Initial camera distance
    
    // Mouse controls event listeners
    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    renderer.domElement.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };
        
        // Update camera rotation based on mouse movement
        cameraRotation.x += deltaMove.y * 0.01;
        cameraRotation.y += deltaMove.x * 0.01;
        
        // Clamp vertical rotation to avoid flipping
        cameraRotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraRotation.x));
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    renderer.domElement.addEventListener('mouseleave', () => {
      isDragging = false;
    });
    
    // Zoom with mouse wheel
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // Adjust camera distance (zoom)
      cameraDistance += e.deltaY * 0.05;
      
      // Clamp to reasonable values
      cameraDistance = Math.max(5, Math.min(50, cameraDistance));
    });
    
    // Mock Data Generation - would come from API in real implementation
    const generateMockData = () => {
      const incidentTypes = [
        'Bias/Discrimination', 'Privacy Violation', 'Misinformation',
        'Performance Failure', 'Security Vulnerability', 'Autonomous System Failure',
        'Transparency Issue', 'Unexpected Behavior', 'Content Moderation Failure'
      ];
      
      const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
      const companies = ['OpenAI', 'Google', 'Microsoft', 'Meta', 'Anthropic', 'Independent'];
      
      const incidents = [];
      for (let i = 0; i < 120; i++) {
        const year = 2018 + Math.floor(Math.random() * 7); // 2018 to 2024
        const typeIndex = Math.floor(Math.random() * incidentTypes.length);
        const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        
        incidents.push({
          id: i,
          year,
          type: incidentTypes[typeIndex],
          typeIndex, // use this for consistent coloring
          severity,
          severityIndex: severityLevels.indexOf(severity),
          company,
          companyIndex: companies.indexOf(company)
        });
      }
      return incidents;
    };
    
    const incidents = generateMockData();
    
    // Get distinct severities, types, and companies for coloring
    const uniqueTypes = _.uniqBy(incidents, 'type').map(i => i.type);
    const uniqueCompanies = _.uniqBy(incidents, 'company').map(i => i.company);
    
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
    
    const companyColors = [
      0x3B82F6, 0x10B981, 0xF59E0B, 0xEF4444, 
      0x8B5CF6, 0x6B7280
    ];
    
    // Initialize gravity simulation parameters
    let nodes = [];
    let links = [];
    
    // Create visualization based on selected type
    const createVisualization = (type) => {
      // Clear previous visualization
      while(scene.children.length > 0) { 
        if (scene.children[0].type === "Light") {
          scene.children.shift();
        } else {
          scene.remove(scene.children[0]); 
        }
      }
      scene.add(ambientLight);
      scene.add(directionalLight);
      
      if (type === 'network') {
        createNetworkViz();
      } else if (type === 'timeline') {
        createTimelineViz();
      } else if (type === 'severity') {
        createSeverityViz();
      }
      
      setLoading(false);
    };
    
    // Network visualization - nodes and links between incidents, types, and companies
    const createNetworkViz = () => {
      nodes = [];
      links = [];
      
      // Create a node for each incident
      incidents.forEach(incident => {
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
          color: severityColors[incident.severity],
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
        
        sphere.userData = { 
          type: 'incident', 
          data: incident,
          index: nodes.length
        };
        
        nodes.push({
          id: `incident-${incident.id}`,
          object: sphere,
          x: sphere.position.x,
          y: sphere.position.y,
          z: sphere.position.z,
          vx: 0, vy: 0, vz: 0  // velocity components for simulation
        });
        
        scene.add(sphere);
      });
      
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
        
        cube.userData = { 
          type: 'incidentType', 
          value: type,
          index: nodes.length
        };
        
        nodes.push({
          id: `type-${type}`,
          object: cube,
          x: cube.position.x,
          y: cube.position.y,
          z: cube.position.z,
          vx: 0, vy: 0, vz: 0,
          fixed: true  // these nodes don't move in simulation
        });
        
        scene.add(cube);
      });
      
      // Create links between incidents and their types
      incidents.forEach((incident, idx) => {
        const incidentNode = nodes[idx];
        const typeNode = nodes.find(n => 
          n.id === `type-${incident.type}`
        );
        
        if (incidentNode && typeNode) {
          const material = new THREE.LineBasicMaterial({ 
            color: typeColors[incident.typeIndex % typeColors.length],
            transparent: true,
            opacity: 0.3
          });
          
          const points = [
            new THREE.Vector3(incidentNode.x, incidentNode.y, incidentNode.z),
            new THREE.Vector3(typeNode.x, typeNode.y, typeNode.z)
          ];
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geometry, material);
          
          links.push({
            source: incidentNode,
            target: typeNode,
            object: line
          });
          
          scene.add(line);
        }
      });
    };
    
    // Timeline visualization - incidents arranged by year
    const createTimelineViz = () => {
      const groupedByYear = _.groupBy(incidents, 'year');
      const years = Object.keys(groupedByYear).sort();
      
      // Position for each year along X axis
      years.forEach((year, yearIndex) => {
        const yearIncidents = groupedByYear[year];
        
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
        
        // Create a cylinder for each year to hold incidents
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
        
        // Create spheres for incidents in this year
        yearIncidents.forEach((incident, index) => {
          const geometry = new THREE.SphereGeometry(0.3, 16, 16);
          const material = new THREE.MeshPhongMaterial({ 
            color: severityColors[incident.severity]
          });
          const sphere = new THREE.Mesh(geometry, material);
          
          // Arrange in a spiral around the cylinder
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
    
    // Severity visualization - arrange by severity in concentric spheres
    const createSeverityViz = () => {
      const severityLevels = ['Critical', 'High', 'Medium', 'Low'];
      const ringRadius = [4, 8, 12, 16];
      
      // Create concentric rings for severity levels
      severityLevels.forEach((severity, severityIndex) => {
        const severityIncidents = incidents.filter(i => i.severity === severity);
        
        // Create a ring to represent the severity level
        const ringGeometry = new THREE.TorusGeometry(ringRadius[severityIndex], 0.1, 16, 100);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
          color: severityColors[severity],
          transparent: true,
          opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        
        scene.add(ring);
        
        // Add a text label for the severity
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
        
        // Place incident dots along the ring
        severityIncidents.forEach((incident, index) => {
          const geometry = new THREE.SphereGeometry(0.2, 16, 16);
          const material = new THREE.MeshPhongMaterial({ 
            color: typeColors[incident.typeIndex % typeColors.length]
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
    
    // Initial visualization
    createVisualization(vizType);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (vizType === 'network') {
        // Update link positions based on node positions
        links.forEach(link => {
          const sourcePos = link.source.object.position;
          const targetPos = link.target.object.position;
          
          // Update line geometry to match current node positions
          const points = [
            new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
            new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
          ];
          
          link.object.geometry.dispose();
          link.object.geometry = new THREE.BufferGeometry().setFromPoints(points);
        });
      }
      
      // Update camera position based on rotation and distance
      camera.position.x = cameraDistance * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
      camera.position.y = cameraDistance * Math.sin(cameraRotation.x);
      camera.position.z = cameraDistance * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = 600;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Change visualization type
    const changeVizType = (type) => {
      setVizType(type);
      setLoading(true);
      createVisualization(type);
    };
    
    // Make the changeVizType function accessible outside this effect
    mountRef.current.changeVizType = changeVizType;
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Remove mouse event listeners
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', () => {});
        renderer.domElement.removeEventListener('mousemove', () => {});
        renderer.domElement.removeEventListener('mouseup', () => {});
        renderer.domElement.removeEventListener('mouseleave', () => {});
        renderer.domElement.removeEventListener('wheel', () => {});
      }
      
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);
  
  const handleVizChange = (type) => {
    setVizType(type);
    mountRef.current.changeVizType(type);
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Safety Incidents 3D Explorer</h2>
        <p className="text-gray-600">Explore AI safety incidents in an interactive 3D environment</p>
        
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => handleVizChange('network')}
            className={`px-4 py-2 rounded-md ${vizType === 'network' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Network View
          </button>
          <button 
            onClick={() => handleVizChange('timeline')}
            className={`px-4 py-2 rounded-md ${vizType === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Timeline View
          </button>
          <button 
            onClick={() => handleVizChange('severity')}
            className={`px-4 py-2 rounded-md ${vizType === 'severity' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Severity View
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-lg font-medium">Loading visualization...</div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="w-full h-[600px] bg-gray-50 rounded-md"
      >
        {/* Three.js canvas will be mounted here */}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Interact with the visualization by dragging to rotate, scrolling to zoom, and using the buttons to change views.</p>
        <p className="mt-2">
          <strong>Network View:</strong> Shows connections between incidents and their types<br />
          <strong>Timeline View:</strong> Arranges incidents by year in cylindrical formations<br />
          <strong>Severity View:</strong> Organizes incidents in concentric rings by severity level
        </p>
      </div>
    </div>
  );
};

export default AISafety3DVisualization;