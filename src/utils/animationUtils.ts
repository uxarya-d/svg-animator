
import { Keyframe, AnimationProperties } from '../context/AnimationContext';

// Generate CSS for animation keyframes
export const generateKeyframeCSS = (
  animationName: string,
  keyframes: Keyframe[],
  duration: number
): string => {
  if (!keyframes.length) return '';
  
  let css = `@keyframes ${animationName} {\n`;
  
  // Sort keyframes by time
  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
  
  // Add each keyframe
  sortedKeyframes.forEach(keyframe => {
    const percentage = (keyframe.time / duration) * 100;
    css += `  ${percentage.toFixed(1)}% {\n`;
    
    // Add properties
    Object.entries(keyframe.properties).forEach(([key, value]) => {
      if (value === undefined) return;
      
      // Special handling for transform properties
      if (key === 'translateX' || key === 'translateY' || key === 'rotate' || key === 'scale') {
        // If this is the first transform property, initialize the transform string
        if (!css.includes('    transform:')) {
          css += '    transform: ';
        } else {
          // Remove the last semicolon and newline to continue the transform
          css = css.substring(0, css.lastIndexOf(';')) + ' ';
        }
        
        // Add the appropriate transform function
        switch (key) {
          case 'translateX':
            css += `translateX(${value}px) `;
            break;
          case 'translateY':
            css += `translateY(${value}px) `;
            break;
          case 'rotate':
            css += `rotate(${value}deg) `;
            break;
          case 'scale':
            css += `scale(${value}) `;
            break;
        }
        
        // Add semicolon and newline
        css += ';\n';
      } else {
        // Convert camelCase to kebab-case for CSS
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `    ${cssKey}: ${propertyToCSS(key, value)};\n`;
      }
    });
    
    css += '  }\n';
  });
  
  css += '}\n';
  return css;
};

// Converts a property value to CSS string representation
export const propertyToCSS = (property: string, value: any): string => {
  if (value === undefined || value === null) return '';
  
  // Handle special cases
  switch (property) {
    case 'translateX':
    case 'translateY':
      return `${value}px`;
    case 'rotate':
      return `${value}deg`;
    case 'fill':
    case 'stroke':
      // Return color values as is
      return value.toString();
    case 'strokeWidth':
      return `${value}px`;
    default:
      return value.toString();
  }
};

// Get a clean CSS class name from a string
export const getClassName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Add animation properties to an SVG element
export const applyAnimationToSVG = (
  svgString: string,
  animationCSS: string
): string => {
  // Add a style tag to the SVG
  return svgString.replace(
    /<svg([^>]*)>/,
    `<svg$1><style>${animationCSS}</style>`
  );
};

// Create a download link for SVG content
export const createDownloadLink = (svgContent: string, fileName: string): string => {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
};

// Default animation properties for new layers
export const defaultProperties: AnimationProperties = {
  fill: 'none',
  stroke: '#000000',
  strokeWidth: 1,
  opacity: 1,
  translateX: 0,
  translateY: 0,
  rotate: 0,
  scale: 1
};

// Properties that can be animated with their UI labels
export const animatableProperties = [
  { id: 'fill', label: 'Fill Color', type: 'color' },
  { id: 'stroke', label: 'Stroke Color', type: 'color' },
  { id: 'strokeWidth', label: 'Stroke Width', type: 'number', min: 0, max: 20, step: 0.5 },
  { id: 'opacity', label: 'Opacity', type: 'number', min: 0, max: 1, step: 0.1 },
  { id: 'translateX', label: 'Move X', type: 'number', min: -500, max: 500, step: 1 },
  { id: 'translateY', label: 'Move Y', type: 'number', min: -500, max: 500, step: 1 },
  { id: 'rotate', label: 'Rotate', type: 'number', min: -360, max: 360, step: 1 },
  { id: 'scale', label: 'Scale', type: 'number', min: 0, max: 5, step: 0.1 }
];
