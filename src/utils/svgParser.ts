
import { SVGLayer } from '../context/AnimationContext';

// Generate a unique ID for each layer
export const generateId = (prefix: string = 'layer'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Parse SVG string to extract path elements
export const parsePathElements = (svgString: string): SVGLayer[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  
  // Check for parser errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid SVG content');
  }
  
  // Get all SVG elements we want to animate
  const pathElements = doc.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon');
  
  // Convert NodeList to array of SVGLayer objects
  const layers: SVGLayer[] = Array.from(pathElements).map((element, index) => {
    // Add ID if element doesn't have one
    if (!element.id) {
      element.id = generateId(`path-${index}`);
    }
    
    // Determine element type
    let type: 'path' | 'circle' | 'rect' | 'group' = 'path';
    if (element.nodeName.toLowerCase() === 'circle') {
      type = 'circle';
    } else if (element.nodeName.toLowerCase() === 'rect') {
      type = 'rect';
    }
    
    // Extract path data or other relevant attributes
    let pathData;
    if (element.nodeName.toLowerCase() === 'path') {
      pathData = element.getAttribute('d') || undefined;
    }
    
    // Initial properties based on element attributes
    const properties: Record<string, string | number | undefined> = {
      fill: element.getAttribute('fill') || 'none',
      stroke: element.getAttribute('stroke') || '#000000',
      strokeWidth: parseFloat(element.getAttribute('stroke-width') || '1'),
      opacity: parseFloat(element.getAttribute('opacity') || '1')
    };
    
    return {
      id: element.id,
      name: `Layer ${index + 1}`,
      type,
      element: element as SVGElement,
      pathData,
      properties,
      keyframes: [],
      isSelected: false,
      isHighlighted: false
    };
  });
  
  return layers;
};

// Apply SVG layer styles based on animation state
export const applySVGStyles = (
  svgElement: SVGSVGElement, 
  layers: SVGLayer[], 
  currentTime: number
): void => {
  if (!svgElement) return;
  
  // Process each layer
  const processLayers = (layersList: SVGLayer[]) => {
    layersList.forEach(layer => {
      // For groups, process children recursively
      if (layer.type === 'group' && layer.children) {
        processLayers(layer.children);
        return;
      }
      
      // Find the element in the SVG DOM
      const element = svgElement.querySelector(`#${layer.id}`);
      if (!element) return;
      
      // Reset highlighted and selected states
      element.classList.remove('svg-highlighted', 'svg-selected');
      
      // Apply highlighted state
      if (layer.isHighlighted) {
        element.classList.add('svg-highlighted');
      }
      
      // Apply selected state
      if (layer.isSelected) {
        element.classList.add('svg-selected');
      }
      
      // Apply current animation state based on keyframes
      if (layer.keyframes.length > 0) {
        // Find the keyframes that surround the current time
        const sortedKeyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);
        
        let prevKeyframe = sortedKeyframes[0];
        let nextKeyframe = sortedKeyframes[sortedKeyframes.length - 1];
        
        for (let i = 0; i < sortedKeyframes.length - 1; i++) {
          if (sortedKeyframes[i].time <= currentTime && sortedKeyframes[i + 1].time >= currentTime) {
            prevKeyframe = sortedKeyframes[i];
            nextKeyframe = sortedKeyframes[i + 1];
            break;
          }
        }
        
        // If we're before the first keyframe, use the first keyframe
        if (currentTime <= prevKeyframe.time) {
          applyProperties(element, prevKeyframe.properties);
          return;
        }
        
        // If we're after the last keyframe, use the last keyframe
        if (currentTime >= nextKeyframe.time) {
          applyProperties(element, nextKeyframe.properties);
          return;
        }
        
        // Interpolate between keyframes
        const progress = (currentTime - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
        const interpolatedProps = interpolateProperties(prevKeyframe.properties, nextKeyframe.properties, progress);
        
        applyProperties(element, interpolatedProps);
      }
    });
  };
  
  processLayers(layers);
};

// Apply properties to SVG element
const applyProperties = (element: Element, properties: Record<string, any>) => {
  // Apply each property
  Object.entries(properties).forEach(([key, value]) => {
    if (value === undefined) return;
    
    // Convert camelCase to kebab-case for SVG attributes
    const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    // Handle transform properties specially
    if (key === 'translateX' || key === 'translateY' || key === 'rotate' || key === 'scale') {
      let transform = element.getAttribute('transform') || '';
      
      // Extract existing transform components
      const translateX = parseFloat(transform.match(/translate\(([^,]+),/)?.[1] || '0');
      const translateY = parseFloat(transform.match(/translate\([^,]+,([^)]+)\)/)?.[1] || '0');
      const rotate = parseFloat(transform.match(/rotate\(([^)]+)\)/)?.[1] || '0');
      const scale = parseFloat(transform.match(/scale\(([^)]+)\)/)?.[1] || '1');
      
      // Update the appropriate component
      let newTransform = '';
      if (key === 'translateX') {
        newTransform = `translate(${value},${translateY}) `;
      } else if (key === 'translateY') {
        newTransform = `translate(${translateX},${value}) `;
      } else if (key === 'rotate') {
        newTransform = `rotate(${value}) `;
      } else if (key === 'scale') {
        newTransform = `scale(${value}) `;
      }
      
      // Combine transforms
      element.setAttribute('transform', newTransform);
    } else {
      // Set regular attribute
      element.setAttribute(attrName, value.toString());
    }
  });
};

// Interpolate between two property sets
const interpolateProperties = (
  props1: Record<string, any>,
  props2: Record<string, any>,
  progress: number
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  // Combine all property keys
  const allKeys = new Set([...Object.keys(props1), ...Object.keys(props2)]);
  
  allKeys.forEach(key => {
    const value1 = props1[key];
    const value2 = props2[key];
    
    // If either value is undefined, use the other
    if (value1 === undefined) {
      result[key] = value2;
      return;
    }
    
    if (value2 === undefined) {
      result[key] = value1;
      return;
    }
    
    // Handle different value types
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      // Interpolate numbers
      result[key] = value1 + (value2 - value1) * progress;
    } else if (typeof value1 === 'string' && typeof value2 === 'string') {
      // Try to interpolate colors
      if (value1.startsWith('#') && value2.startsWith('#')) {
        result[key] = interpolateColor(value1, value2, progress);
      } else {
        // Default to using the target value
        result[key] = progress > 0.5 ? value2 : value1;
      }
    } else {
      // Default to using the target value
      result[key] = progress > 0.5 ? value2 : value1;
    }
  });
  
  return result;
};

// Interpolate between two colors
const interpolateColor = (color1: string, color2: string, progress: number): string => {
  // Convert hex to RGB
  const hex2rgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  
  // Convert RGB to hex
  const rgb2hex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  
  // Get RGB values
  const [r1, g1, b1] = hex2rgb(color1);
  const [r2, g2, b2] = hex2rgb(color2);
  
  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  
  return rgb2hex(r, g, b);
};
