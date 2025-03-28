import React, { useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { groupBy, uniqBy } from 'lodash';

// Import THREE.js only on the client side
let THREE;
if (typeof window !== 'undefined') {
  THREE = require('three');
}

const AISafety3DVisualization = ({ incidents, statistics }) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [vizType, setVizType] = useState('network');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  
  console.log('AISafety3DVisualization rendering with:', { 
    incidentsCount: incidents?.length, 
    statistics: statistics ? 'present' : 'missing',
    mountRef: mountRef?.current ? 'mounted' : 'not mounted',
    vizType
  });

  // Process incidents data for visualization
  const processedData = useMemo(() => {
    if (!incidents) return null;

    // Extract years from incidents
    const years = [...new Set(incidents.map(i => i.year))].sort();
    
    // Create entity lists
    const developers = new Set();
    const deployers = new Set();
    const harmedParties = new Set();
    
    incidents.forEach(incident => {
      incident.developer?.forEach(d => developers.add(d));
      incident.deployer?.forEach(d => deployers.add(d));
      incident.harmedParties?.forEach(h => harmedParties.add(h));
    });

    // Create incident types based on entities involved
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

    // Assign pseudo-types based on description keywords
    const incidentsWithTypes = incidents.map(incident => {
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
      
      // Estimate a severity level based on harmed parties
      const severityIndex = incident.harmedParties?.length > 2 ? 3 : 
                           incident.harmedParties?.length > 1 ? 2 : 
                           incident.harmedParties?.length > 0 ? 1 : 0;
      
      const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
      
      return {
        ...incident,
        type: incidentTypes[typeIndex],
        typeIndex,
        severity: severityLevels[severityIndex],
        severityIndex
      };
    });

    return {
      incidents: incidentsWithTypes,
      incidentTypes,
      years,
      developers: [...developers],
      deployers: [...deployers],
      harmedParties: [...harmedParties],
      severityLevels: ['Low', 'Medium', 'High', 'Critical'],
    };
  }, [incidents]);

  // Add an error state
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("UseEffect running:", {
      hasProcessedData: !!processedData,
      hasMountRef: !!mountRef.current,
      hasThree: !!THREE
    });
    
    // Check if we're running on the client side
    if (typeof window === 'undefined') {
      console.log("Skipping Three.js initialization - running on server");
      return;
    }
    
    // Check if THREE is available
    if (!THREE) {
      console.error("THREE.js not available");
      setError("THREE.js library failed to load");
      setLoading(false);
      return;
    }
    
    if (!processedData) {
      console.error("No processed data available");
      setError("Failed to process incident data");
      setLoading(false);
      return;
    }
    
    if (!mountRef.current) {
      console.error("Mount ref is not available");
      setError("Visualization container not found");
      setLoading(false);
      return;
    }

    try {
      // Scene setup
      const width = mountRef.current.clientWidth;
      const height = 600;
      console.log("Creating scene with dimensions:", { width, height });
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f5ff);
      
      // ADD TEST OBJECT - A large, obvious sphere
      const testGeometry = new THREE.SphereGeometry(5, 32, 32);
      const testMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0x440000,
        specular: 0xffffff,
        shininess: 30
      });
      const testSphere = new THREE.Mesh(testGeometry, testMaterial);
      testSphere.position.set(0, 0, 0);
      scene.add(testSphere);
      console.log("Added test sphere to scene");
    
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
    
    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
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
      // Update mouse position for raycasting
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update camera position when dragging
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
      setHoverInfo(null);
    });
    
    // Click event for selection
    renderer.domElement.addEventListener('click', (e) => {
      // Use raycaster to detect clicks on objects
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        if (clickedObject.userData && clickedObject.userData.incident) {
          setSelectedIncident(clickedObject.userData.incident);
        }
      } else {
        // Clear selection when clicking empty space
        setSelectedIncident(null);
      }
    });
    
    // Zoom with mouse wheel
    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // Adjust camera distance (zoom)
      cameraDistance += e.deltaY * 0.05;
      
      // Clamp to reasonable values
      cameraDistance = Math.max(5, Math.min(50, cameraDistance));
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
    
    const entityColors = [
      0x3B82F6, 0x10B981, 0xF59E0B, 0xEF4444, 
      0x8B5CF6, 0x6B7280
    ];
    
    // Initialize gravity simulation parameters
    let nodes = [];
    let links = [];
    
    // Create visualization based on selected type
    const createVisualization = (type) => {
      console.log(`Creating visualization: ${type}`);
      
      // Clear previous visualization
      while(scene.children.length > 0) { 
        if (scene.children[0].type === "Light" || scene.children[0].type === "HemisphereLight") {
          scene.children.shift();
        } else {
          scene.remove(scene.children[0]); 
        }
      }
      scene.add(ambientLight);
      scene.add(directionalLight);
      
      // Always add a test object so something is visible
      const testGeometry = new THREE.SphereGeometry(5, 32, 32);
      const testMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        emissive: 0x004400,
        specular: 0xffffff,
        shininess: 30
      });
      const testSphere = new THREE.Mesh(testGeometry, testMaterial);
      testSphere.position.set(0, 0, 0);
      scene.add(testSphere);
      console.log(`Added test sphere to ${type} visualization`);
      
      try {
        if (type === 'network') {
          createNetworkViz();
        } else if (type === 'timeline') {
          createTimelineViz();
        } else if (type === 'severity') {
          createSeverityViz();
        } else if (type === 'entity') {
          createEntityViz();
        }
      } catch (err) {
        console.error(`Error creating ${type} visualization:`, err);
        // Keep the test sphere visible at least
      }
      
      setLoading(false);
    };
    
    // Network visualization - nodes and links between incidents, types, and companies
    const createNetworkViz = () => {
      nodes = [];
      links = [];
      
      // Create a node for each incident
      processedData.incidents.forEach(incident => {
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
          incident: incident,
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
      processedData.incidentTypes.forEach((type, index) => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ 
          color: typeColors[index % typeColors.length],
          transparent: false
        });
        const cube = new THREE.Mesh(geometry, material);
        
        // Position in a circle
        const angle = (index / processedData.incidentTypes.length) * Math.PI * 2;
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
        scene.add(label);
      });
      
      // Create links between incidents and their types
      processedData.incidents.forEach((incident, idx) => {
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
      const yearGroups = groupBy(processedData.incidents, 'year');
      const years = Object.keys(yearGroups).sort();
      
      // Position for each year along X axis
      years.forEach((year, yearIndex) => {
        const yearIncidents = yearGroups[year];
        
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
            color: typeColors[incident.typeIndex % typeColors.length]
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
        const severityIncidents = processedData.incidents.filter(i => i.severity === severity);
        
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
    
    // Entity visualization - arrange incidents by key entities involved
    const createEntityViz = () => {
      // Take only top 10 entities with most incidents for clearer visualization
      const topEntities = processedData.developers
        .concat(processedData.deployers)
        .filter(entity => entity && entity.length > 0) // Filter out empty entities
        .map(entity => {
          const relatedIncidents = processedData.incidents.filter(inc => 
            (inc.developer && inc.developer.includes(entity)) || 
            (inc.deployer && inc.deployer.includes(entity))
          );
          return {
            name: entity,
            count: relatedIncidents.length,
            incidents: relatedIncidents
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Position entities in a circle
      topEntities.forEach((entity, index) => {
        const angle = (index / topEntities.length) * Math.PI * 2;
        const r = 15;
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);
        
        // Create entity node (cube)
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshPhongMaterial({ 
          color: entityColors[index % entityColors.length]
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, 0, z);
        
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
        context.fillText(`${entity.name} (${entity.count})`, canvas.width / 2, canvas.height / 2);
        
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
        
        scene.add(cube);
        scene.add(label);
        
        // Create incident spheres around this entity
        entity.incidents.forEach((incident, incidentIndex) => {
          const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const sphereMaterial = new THREE.MeshPhongMaterial({ 
            color: typeColors[incident.typeIndex % typeColors.length]
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          
          // Position in a small circle around the entity node
          const incidentAngle = (incidentIndex / entity.incidents.length) * Math.PI * 2;
          const smallR = 3;
          sphere.position.x = x + Math.cos(incidentAngle) * smallR;
          sphere.position.y = Math.sin(incidentAngle) * 2; // Some vertical distribution
          sphere.position.z = z + Math.sin(incidentAngle) * smallR;
          
          sphere.userData = { incident };
          
          scene.add(sphere);
          
          // Create a line connecting to the entity
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: entityColors[index % entityColors.length],
            transparent: true,
            opacity: 0.3
          });
          
          const points = [
            new THREE.Vector3(x, 0, z),
            sphere.position
          ];
          
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeometry, lineMaterial);
          
          scene.add(line);
        });
      });
    };
    
    // Initial visualization
    createVisualization(vizType);
    
    // Update hover info in animation loop
    const updateHoverInfo = () => {
      // Only update if not dragging
      if (!isDragging) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          const hoveredObject = intersects[0].object;
          
          if (hoveredObject.userData && hoveredObject.userData.incident) {
            const incident = hoveredObject.userData.incident;
            setHoverInfo({
              id: incident.id,
              title: incident.title,
              date: incident.date,
              type: incident.type,
              severity: incident.severity,
              position: {
                x: hoveredObject.position.x,
                y: hoveredObject.position.y,
                z: hoveredObject.position.z
              }
            });
            
            // Highlight the hovered object
            hoveredObject.scale.set(1.2, 1.2, 1.2);
          } else {
            setHoverInfo(null);
          }
        } else {
          setHoverInfo(null);
          
          // Reset scales of all incident spheres
          scene.children.forEach(obj => {
            if (obj.userData && obj.userData.incident && obj.scale.x !== 1) {
              obj.scale.set(1, 1, 1);
            }
          });
        }
      }
    };
    
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
      
      // Update hover info
      updateHoverInfo();
      
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
      setSelectedIncident(null);
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
        renderer.domElement.removeEventListener('click', () => {});
      }
      
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
    } catch (err) {
      console.error("Error initializing Three.js visualization:", err);
      setError(`Failed to initialize 3D visualization: ${err.message}`);
      setLoading(false);
    }
  }, [processedData, vizType]);
  
  const handleVizChange = (type) => {
    console.log(`Changing visualization type to: ${type}`);
    setVizType(type);
    
    // Force re-render if needed
    if (mountRef.current && mountRef.current.changeVizType) {
      console.log("Using existing changeVizType function");
      mountRef.current.changeVizType(type);
    } else {
      console.log("No changeVizType function found");
      
      // Refresh the component by toggling loading
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
  };
  
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
          disabled={loading || error}
        >
          Network View
        </button>
        <button 
          onClick={() => handleVizChange('timeline')}
          className={vizType === 'timeline' ? 'active' : ''}
          disabled={loading || error}
        >
          Timeline View
        </button>
        <button 
          onClick={() => handleVizChange('severity')}
          className={vizType === 'severity' ? 'active' : ''}
          disabled={loading || error}
        >
          Severity View
        </button>
        <button 
          onClick={() => handleVizChange('entity')}
          className={vizType === 'entity' ? 'active' : ''}
          disabled={loading || error}
        >
          Entity View
        </button>
      </div>
      
      <div className="viz-description">
        {vizType === 'network' && !error && (
          <p>Network view shows connections between incidents and their types. Drag to rotate, scroll to zoom.</p>
        )}
        {vizType === 'timeline' && !error && (
          <p>Timeline view organizes incidents by year. Incidents are color-coded by type.</p>
        )}
        {vizType === 'severity' && !error && (
          <p>Severity view arranges incidents in concentric rings by severity level from Critical (center) to Low (outer).</p>
        )}
        {vizType === 'entity' && !error && (
          <p>Entity view shows relationships between major entities (companies/organizations) and incidents.</p>
        )}
        {error && (
          <p className="error-message">Error: {error}</p>
        )}
      </div>
      
      <div className="visualization-wrapper">
        {loading && !error && (
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
          ref={mountRef} 
          className="canvas-container"
          style={{ width: '100%', height: '600px', backgroundColor: '#f0f5ff' }}
        ></div>
        
        {hoverInfo && !error && (
          <div 
            className="hover-tooltip"
            style={{
              position: 'absolute',
              left: `${(hoverInfo.position.x / 25 + 1) * 50}%`,
              top: `${(-hoverInfo.position.y / 25 + 1) * 50}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none'
            }}
          >
            <p className="tooltip-title">{hoverInfo.title}</p>
            <p className="tooltip-id">ID: {hoverInfo.id}</p>
            <p className="tooltip-type">{hoverInfo.type}</p>
            <p className="tooltip-severity">{hoverInfo.severity}</p>
          </div>
        )}
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
        
        .viz-controls button:hover {
          background: #e0e0e0;
        }
        
        .viz-controls button.active {
          background: #3b82f6;
          color: white;
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
        
        .error-message {
          color: #d32f2f;
          font-weight: bold;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .hover-tooltip {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 4px;
          max-width: 300px;
          z-index: 20;
        }
        
        .tooltip-title {
          font-weight: bold;
          margin: 0 0 5px;
          font-size: 14px;
        }
        
        .tooltip-id, .tooltip-type, .tooltip-severity {
          margin: 2px 0;
          font-size: 12px;
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

export default AISafety3DVisualization;