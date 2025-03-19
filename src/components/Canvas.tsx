
import React, { useRef, useEffect } from 'react';
import { useAnimation } from '../context/AnimationContext';
import { applySVGStyles } from '../utils/svgParser';

const Canvas = () => {
  const {
    svgContent,
    svgLayers,
    timeline,
    selectedLayerId,
    highlightedLayerId,
    svgFile
  } = useAnimation();
  
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Initialize SVG content
  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;
    
    // Clear previous content
    svgContainerRef.current.innerHTML = '';
    
    // Set the new content
    svgContainerRef.current.innerHTML = svgContent;
    
    // Get the reference to the SVG element
    svgRef.current = svgContainerRef.current.querySelector('svg');
    
    // Apply a default size if needed
    if (svgRef.current) {
      if (!svgRef.current.hasAttribute('width') || !svgRef.current.hasAttribute('height')) {
        svgRef.current.setAttribute('width', '100%');
        svgRef.current.setAttribute('height', '100%');
      }
      
      // Make sure the SVG scales properly
      svgRef.current.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      // Add a viewBox if not present
      if (!svgRef.current.hasAttribute('viewBox')) {
        const width = svgRef.current.width.baseVal.value || 300;
        const height = svgRef.current.height.baseVal.value || 200;
        svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
    }
  }, [svgContent]);
  
  // Apply animation styles based on the timeline
  useEffect(() => {
    if (!svgRef.current || !svgLayers.length) return;
    
    applySVGStyles(svgRef.current, svgLayers, timeline.currentTime);
  }, [svgLayers, timeline.currentTime, selectedLayerId, highlightedLayerId]);
  
  // Render a grid background for the canvas
  const renderGrid = () => {
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f1f1f1 1px, transparent 1px),
            linear-gradient(to bottom, #f1f1f1 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    );
  };
  
  return (
    <div className="animation-panel h-full flex items-center justify-center relative overflow-hidden">
      {renderGrid()}
      
      {!svgContent && (
        <div className="text-center p-4 bg-white/50 max-w-xs absolute">
          <p className="text-lg font-medium mb-2">Canvas</p>
          <p className="text-sm text-gray-500">
            Upload an SVG file to see the preview here
          </p>
        </div>
      )}
      
      <div 
        ref={svgContainerRef} 
        className="flex items-center justify-center w-full h-full p-4"
        style={{ overflowY: 'auto', overflowX: 'auto' }}
      />
    </div>
  );
};

export default Canvas;
