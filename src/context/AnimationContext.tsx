
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { parsePathElements } from '../utils/svgParser';

export type SVGLayer = {
  id: string;
  name: string;
  type: 'path' | 'circle' | 'rect' | 'group';
  element: SVGElement | null;
  pathData?: string;
  children?: SVGLayer[];
  properties: AnimationProperties;
  keyframes: Keyframe[];
  isSelected: boolean;
  isHighlighted: boolean;
};

export type AnimationProperties = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  translateX?: number;
  translateY?: number;
  rotate?: number;
  scale?: number;
  [key: string]: string | number | undefined;
};

export type Keyframe = {
  id: string;
  time: number;
  properties: AnimationProperties;
};

export type Timeline = {
  duration: number;
  currentTime: number;
  playing: boolean;
};

interface AnimationContextType {
  svgContent: string;
  setSvgContent: (content: string) => void;
  svgLayers: SVGLayer[];
  setSvgLayers: (layers: SVGLayer[]) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  highlightedLayerId: string | null;
  setHighlightedLayerId: (id: string | null) => void;
  timeline: Timeline;
  setTimeline: (timeline: Timeline) => void;
  viewMode: 'layers' | 'code';
  setViewMode: (mode: 'layers' | 'code') => void;
  updateLayer: (layerId: string, updates: Partial<SVGLayer>) => void;
  addKeyframe: (layerId: string, time: number, properties: AnimationProperties) => void;
  removeKeyframe: (layerId: string, keyframeId: string) => void;
  groupLayers: (layerIds: string[], groupName: string) => void;
  ungroupLayers: (groupId: string) => void;
  renameLayer: (layerId: string, newName: string) => void;
  generateAnimatedSVG: () => string;
  togglePlayback: () => void;
  svgFile: File | null;
  setSvgFile: (file: File | null) => void;
  resetWorkspace: () => void;
}

const defaultTimeline: Timeline = {
  duration: 5000, // 5 seconds
  currentTime: 0,
  playing: false
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [svgLayers, setSvgLayers] = useState<SVGLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [highlightedLayerId, setHighlightedLayerId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<Timeline>(defaultTimeline);
  const [viewMode, setViewMode] = useState<'layers' | 'code'>('layers');
  const [svgFile, setSvgFile] = useState<File | null>(null);

  // Update selected layer in layers array
  useEffect(() => {
    if (svgLayers.length > 0) {
      const updatedLayers = svgLayers.map(layer => {
        if (layer.id === selectedLayerId) {
          return { ...layer, isSelected: true };
        }
        
        if (layer.children && layer.children.length > 0) {
          const updatedChildren = layer.children.map(child => {
            return { ...child, isSelected: child.id === selectedLayerId };
          });
          return { ...layer, children: updatedChildren, isSelected: layer.id === selectedLayerId };
        }
        
        return { ...layer, isSelected: false };
      });
      
      setSvgLayers(updatedLayers);
    }
  }, [selectedLayerId]);

  // Update highlighted layer in layers array
  useEffect(() => {
    if (svgLayers.length > 0) {
      const updatedLayers = svgLayers.map(layer => {
        if (layer.id === highlightedLayerId) {
          return { ...layer, isHighlighted: true };
        }
        
        if (layer.children && layer.children.length > 0) {
          const updatedChildren = layer.children.map(child => {
            return { ...child, isHighlighted: child.id === highlightedLayerId };
          });
          return { ...layer, children: updatedChildren, isHighlighted: layer.id === highlightedLayerId };
        }
        
        return { ...layer, isHighlighted: false };
      });
      
      setSvgLayers(updatedLayers);
    }
  }, [highlightedLayerId]);

  // Animation playback timer
  useEffect(() => {
    let animationFrame: number;
    
    const updateTime = () => {
      if (timeline.playing) {
        setTimeline(prev => {
          const newTime = prev.currentTime + 16.67; // Roughly 60fps
          
          // Loop back to start if we reach the end
          if (newTime >= prev.duration) {
            return { ...prev, currentTime: 0 };
          }
          
          return { ...prev, currentTime: newTime };
        });
        
        animationFrame = requestAnimationFrame(updateTime);
      }
    };
    
    if (timeline.playing) {
      animationFrame = requestAnimationFrame(updateTime);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [timeline.playing]);

  const updateLayer = (layerId: string, updates: Partial<SVGLayer>) => {
    setSvgLayers(prevLayers => {
      return prevLayers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, ...updates };
        }
        
        if (layer.children && layer.children.length > 0) {
          const updatedChildren = layer.children.map(child => {
            if (child.id === layerId) {
              return { ...child, ...updates };
            }
            return child;
          });
          
          return { ...layer, children: updatedChildren };
        }
        
        return layer;
      });
    });
  };

  const addKeyframe = (layerId: string, time: number, properties: AnimationProperties) => {
    setSvgLayers(prevLayers => {
      return prevLayers.map(layer => {
        if (layer.id === layerId) {
          const newKeyframe: Keyframe = {
            id: `kf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            time,
            properties
          };
          
          // Sort keyframes by time
          const updatedKeyframes = [...layer.keyframes, newKeyframe]
            .sort((a, b) => a.time - b.time);
          
          return { ...layer, keyframes: updatedKeyframes };
        }
        
        if (layer.children && layer.children.length > 0) {
          const updatedChildren = layer.children.map(child => {
            if (child.id === layerId) {
              const newKeyframe: Keyframe = {
                id: `kf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                time,
                properties
              };
              
              const updatedKeyframes = [...child.keyframes, newKeyframe]
                .sort((a, b) => a.time - b.time);
              
              return { ...child, keyframes: updatedKeyframes };
            }
            return child;
          });
          
          return { ...layer, children: updatedChildren };
        }
        
        return layer;
      });
    });
  };

  const removeKeyframe = (layerId: string, keyframeId: string) => {
    setSvgLayers(prevLayers => {
      return prevLayers.map(layer => {
        if (layer.id === layerId) {
          return {
            ...layer,
            keyframes: layer.keyframes.filter(kf => kf.id !== keyframeId)
          };
        }
        
        if (layer.children && layer.children.length > 0) {
          const updatedChildren = layer.children.map(child => {
            if (child.id === layerId) {
              return {
                ...child,
                keyframes: child.keyframes.filter(kf => kf.id !== keyframeId)
              };
            }
            return child;
          });
          
          return { ...layer, children: updatedChildren };
        }
        
        return layer;
      });
    });
  };

  const groupLayers = (layerIds: string[], groupName: string) => {
    // Create new group
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Find layers to be grouped
    const layersToGroup: SVGLayer[] = [];
    const remainingLayers: SVGLayer[] = [];
    
    svgLayers.forEach(layer => {
      if (layerIds.includes(layer.id)) {
        layersToGroup.push(layer);
      } else {
        remainingLayers.push(layer);
      }
    });
    
    // Create new group layer
    const newGroup: SVGLayer = {
      id: groupId,
      name: groupName,
      type: 'group',
      element: null,
      children: layersToGroup,
      properties: {},
      keyframes: [],
      isSelected: false,
      isHighlighted: false
    };
    
    // Add new group to layers
    setSvgLayers([...remainingLayers, newGroup]);
  };

  const ungroupLayers = (groupId: string) => {
    setSvgLayers(prevLayers => {
      // Find the group to ungroup
      const group = prevLayers.find(layer => layer.id === groupId);
      
      if (!group || !group.children) {
        return prevLayers;
      }
      
      // Remove the group and add its children to the top level
      const updatedLayers = prevLayers
        .filter(layer => layer.id !== groupId)
        .concat(group.children);
      
      return updatedLayers;
    });
  };

  const renameLayer = (layerId: string, newName: string) => {
    setSvgLayers(prevLayers => {
      return prevLayers.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, name: newName };
        }
        
        if (layer.children && layer.children.length > 0) {
          const updatedChildren = layer.children.map(child => {
            if (child.id === layerId) {
              return { ...child, name: newName };
            }
            return child;
          });
          
          return { ...layer, children: updatedChildren };
        }
        
        return layer;
      });
    });
  };

  const generateAnimatedSVG = () => {
    // This is a simplified implementation - a real solution would generate
    // CSS keyframes based on the animation data
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Apply classes to all layers
    const applyClasses = (layers: SVGLayer[]) => {
      layers.forEach(layer => {
        if (layer.type === 'group') {
          // Find or create a g element
          let groupElement = svgDoc.querySelector(`g#${layer.id}`);
          
          if (!groupElement) {
            groupElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
            groupElement.id = layer.id;
            svgDoc.documentElement.appendChild(groupElement);
          }
          
          // Apply class to the group
          groupElement.setAttribute('class', layer.name);
          
          // Process children
          if (layer.children) {
            applyClasses(layer.children);
            
            // Move children into the group
            layer.children.forEach(child => {
              const childElement = svgDoc.querySelector(`[id="${child.id}"]`);
              if (childElement) {
                groupElement?.appendChild(childElement);
              }
            });
          }
        } else {
          // Find the element
          const element = svgDoc.querySelector(`[id="${layer.id}"]`);
          
          if (element) {
            // Apply class based on layer name
            element.setAttribute('class', layer.name);
          }
        }
      });
    };
    
    applyClasses(svgLayers);
    
    // Generate the style element with animations
    const styleElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.textContent = generateCSSAnimations(svgLayers);
    svgDoc.documentElement.appendChild(styleElement);
    
    // Return the serialized SVG
    return new XMLSerializer().serializeToString(svgDoc);
  };

  const generateCSSAnimations = (layers: SVGLayer[]): string => {
    let css = '';
    
    layers.forEach(layer => {
      if (layer.keyframes.length > 0) {
        // Generate keyframes
        css += `\n@keyframes anim-${layer.name} {\n`;
        
        layer.keyframes.forEach(keyframe => {
          const percentage = (keyframe.time / timeline.duration) * 100;
          css += `  ${percentage.toFixed(1)}% {\n`;
          
          // Add properties
          Object.entries(keyframe.properties).forEach(([key, value]) => {
            if (value !== undefined) {
              // Convert camelCase to kebab-case for CSS
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              css += `    ${cssKey}: ${value};\n`;
            }
          });
          
          css += '  }\n';
        });
        
        css += '}\n';
        
        // Apply animation to the element
        css += `.${layer.name} {\n`;
        css += `  animation: anim-${layer.name} ${timeline.duration / 1000}s linear forwards;\n`;
        css += '}\n';
      }
      
      // Process children if this is a group
      if (layer.type === 'group' && layer.children) {
        css += generateCSSAnimations(layer.children);
      }
    });
    
    return css;
  };

  const togglePlayback = () => {
    setTimeline(prev => ({ ...prev, playing: !prev.playing }));
  };

  const resetWorkspace = () => {
    setSvgContent('');
    setSvgLayers([]);
    setSelectedLayerId(null);
    setHighlightedLayerId(null);
    setTimeline(defaultTimeline);
    setViewMode('layers');
    setSvgFile(null);
  };

  return (
    <AnimationContext.Provider
      value={{
        svgContent,
        setSvgContent,
        svgLayers,
        setSvgLayers,
        selectedLayerId,
        setSelectedLayerId,
        highlightedLayerId,
        setHighlightedLayerId,
        timeline,
        setTimeline,
        viewMode,
        setViewMode,
        updateLayer,
        addKeyframe,
        removeKeyframe,
        groupLayers,
        ungroupLayers,
        renameLayer,
        generateAnimatedSVG,
        togglePlayback,
        svgFile,
        setSvgFile,
        resetWorkspace
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
