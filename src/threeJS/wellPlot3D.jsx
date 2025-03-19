import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const WellPlotVisualization = ({ mapData, wellData }) => {
  const mountRef = useRef(null);
  const [hoveredWell, setHoveredWell] = useState(null);
  
  useEffect(() => {
    // === SETUP ===
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);
    
    // Add orbit controls for better navigation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // === LIGHTING ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
    // === MAP VISUALIZATION ===
    // Function to create base map from data
    const createBaseMap = (data) => {
      // This is a placeholder for your actual map creation logic
      // You'll need to adapt this based on your actual map data format
      const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
      
      // Assuming mapData has height values
      if (data && data.heights) {
        // Apply height data to vertices
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          
          // Convert x,y to map data index
          const xIndex = Math.floor((x + 50) / 100 * data.width);
          const yIndex = Math.floor((y + 50) / 100 * data.height);
          
          // Set vertex height based on map data
          const height = data.heights[yIndex * data.width + xIndex] || 0;
          positions.setZ(i, height * 10); // Scale height for visibility
        }
        
        geometry.computeVertexNormals();
      }
      
      // Create material with color gradients based on height
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        flatShading: true
      });
      
      // Generate colors based on height
      if (data && data.heights) {
        const colorArray = [];
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
          const z = positions.getZ(i);
          
          // Color gradient from blue (low) to yellow (high)
          // You can adjust this to your preferred color scheme
          const color = new THREE.Color();
          color.setHSL(0.6 - (z / 30) * 0.6, 1.0, 0.5);
          
          colorArray.push(color.r, color.g, color.b);
        }
        
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
      }
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2; // Rotate to horizontal plane
      scene.add(mesh);
      
      return mesh;
    };
    
    // === CONTOUR VISUALIZATION ===
    const createContours = (data) => {
      // This is a placeholder for contour line generation
      // You would typically generate line segments based on map height data
      
      const contourLines = new THREE.Group();
      
      // Example: Create contour lines at specific height intervals
      if (data && data.heights) {
        const minHeight = Math.min(...data.heights);
        const maxHeight = Math.max(...data.heights);
        const contourInterval = (maxHeight - minHeight) / 10;
        
        for (let level = minHeight; level <= maxHeight; level += contourInterval) {
          const contourPoints = [];
          
          // Generate contour points - this is simplified
          // In a real implementation, you'd use a proper contour algorithm
          // such as marching squares
          for (let y = 0; y < data.height - 1; y++) {
            for (let x = 0; x < data.width - 1; x++) {
              // Check if current cell crosses contour level
              // This is extremely simplified for example purposes
              const h1 = data.heights[y * data.width + x];
              const h2 = data.heights[y * data.width + x + 1];
              const h3 = data.heights[(y + 1) * data.width + x];
              const h4 = data.heights[(y + 1) * data.width + x + 1];
              
              const crossesContour = (h1 <= level && h2 > level) ||
                                     (h1 > level && h2 <= level) ||
                                     (h1 <= level && h3 > level) ||
                                     (h1 > level && h3 <= level);
              
              if (crossesContour) {
                // Add contour point
                const mapX = (x / data.width) * 100 - 50;
                const mapY = (y / data.height) * 100 - 50;
                contourPoints.push(new THREE.Vector3(mapX, mapY, level * 10 + 0.1)); // Slightly above map
              }
            }
          }
          
          // Create line segments
          if (contourPoints.length > 1) {
            const geometry = new THREE.BufferGeometry().setFromPoints(contourPoints);
            const material = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
            const line = new THREE.Line(geometry, material);
            line.rotation.x = -Math.PI / 2; // Align with map
            contourLines.add(line);
          }
        }
      }
      
      scene.add(contourLines);
      return contourLines;
    };
    
    // === WELL VISUALIZATION ===
    const createWells = (data) => {
      const wells = new THREE.Group();
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      
      if (!data || !data.length) return wells;
      
      // Create a well point for each data entry
      data.forEach((well, index) => {
        // Create well marker (sphere)
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
          color: well.groupColor || 0xff0000,
          emissive: 0x000000
        });
        
        const wellMesh = new THREE.Mesh(geometry, material);
        
        // Position based on map coordinates
        wellMesh.position.set(
          well.x || 0,
          well.z || 0, // Height above terrain
          well.y || 0
        );
        
        // Add surrounding circle to show well radius
        const radiusGeometry = new THREE.CircleGeometry(well.radius || 5, 32);
        const radiusMaterial = new THREE.MeshBasicMaterial({ 
          color: well.groupColor || 0xff0000,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        
        const radiusCircle = new THREE.Mesh(radiusGeometry, radiusMaterial);
        radiusCircle.rotation.x = -Math.PI / 2; // Make it flat on the ground
        radiusCircle.position.copy(wellMesh.position);
        
        // Store well data for interaction
        wellMesh.userData = { ...well, index };
        
        wells.add(wellMesh);
        wells.add(radiusCircle);
      });
      
      // Add raycaster for interaction
      const handleMouseMove = (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
        
        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);
        
        // Find intersections with wells
        const intersects = raycaster.intersectObjects(
          wells.children.filter(child => child.geometry.type === 'SphereGeometry')
        );
        
        if (intersects.length > 0) {
          const wellObject = intersects[0].object;
          // Update hover state or trigger tooltip
          setHoveredWell(wellObject.userData);
          
          // Visual feedback on hover
          wellObject.material.emissive.set(0x555555);
        } else {
          // Reset hover state
          setHoveredWell(null);
          
          // Reset emissive on all wells
          wells.children
            .filter(child => child.geometry.type === 'SphereGeometry')
            .forEach(well => well.material.emissive.set(0x000000));
        }
      };
      
      const handleClick = (event) => {
        // Use same raycaster logic to detect clicks
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          wells.children.filter(child => child.geometry.type === 'SphereGeometry')
        );
        
        if (intersects.length > 0) {
          const wellObject = intersects[0].object;
          console.log('Clicked well:', wellObject.userData);
          // Here you would handle the well selection or click callback
        }
      };
      
      // Add event listeners
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('click', handleClick);
      
      // Clean up function
      return () => {
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('click', handleClick);
      };
    };
    
    // === CREATE VISUALIZATION ===
    // Create base map
    const map = createBaseMap(mapData);
    
    // Create contour lines
    const contours = createContours(mapData);
    
    // Create wells
    const cleanupWells = createWells(wellData);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Clean up on component unmount
    return () => {
      if (cleanupWells) cleanupWells();
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [mapData, wellData]);
  
  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Optional: Well information tooltip */}
      {hoveredWell && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '200px'
        }}>
          <h4>Well {hoveredWell.id || hoveredWell.index}</h4>
          <p>Group: {hoveredWell.group || 'Unassigned'}</p>
          <p>Depth: {hoveredWell.depth || 'Unknown'}</p>
          {/* Add additional well information here */}
        </div>
      )}
    </div>
  );
};

export default WellPlotVisualization;
