
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { parsePathElements } from '../utils/svgParser';
import { generateKeyframeCSS, getClassName } from '../utils/animationUtils';

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

  useEffect(() => {
    let animationFrame: number;
    
    const updateTime = () => {
      if (timeline.playing) {
        setTimeline(prev => {
          const newTime = prev.currentTime + 16.67; // Roughly 60fps
          
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
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const layersToGroup: SVGLayer[] = [];
    const remainingLayers: SVGLayer[] = [];
    
    svgLayers.forEach(layer => {
      if (layerIds.includes(layer.id)) {
        layersToGroup.push(layer);
      } else {
        remainingLayers.push(layer);
      }
    });
    
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
    
    setSvgLayers([...remainingLayers, newGroup]);
  };

  const ungroupLayers = (groupId: string) => {
    setSvgLayers(prevLayers => {
      const group = prevLayers.find(layer => layer.id === groupId);
      
      if (!group || !group.children) {
        return prevLayers;
      }
      
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
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Fix the SVGStyleElement vs HTMLStyleElement type issue
    let styleElement = svgDoc.querySelector('style');
    if (!styleElement) {
      styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      svgDoc.documentElement.insertBefore(styleElement, svgDoc.documentElement.firstChild);
    }
    
    let cssString = '';
    
    const processLayers = (layers: SVGLayer[]) => {
      layers.forEach(layer => {
        if (layer.keyframes.length === 0) {
          return;
        }
        
        const className = getClassName(layer.name);
        
        const element = svgDoc.getElementById(layer.id);
        if (element) {
          const currentClass = element.getAttribute('class') || '';
          if (!currentClass.includes(className)) {
            element.setAttribute('class', currentClass ? `${currentClass} ${className}` : className);
          }
          
          if (layer.keyframes.length > 0) {
            const sortedKeyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);
            
            const animationName = `anim-${className}`;
            
            const keyframeCSS = generateKeyframeCSS(animationName, sortedKeyframes, timeline.duration);
            
            cssString += `.${className} {\n`;
            cssString += `  animation: ${animationName} ${timeline.duration / 1000}s linear infinite;\n`;
            
            if (sortedKeyframes.some(kf => 'rotate' in kf.properties)) {
              cssString += `  transform-origin: center;\n`;
              cssString += `  transform-box: fill-box;\n`;
            }
            
            cssString += `}\n\n`;
            
            cssString += keyframeCSS;
            cssString += '\n';
          }
        }
        
        if (layer.type === 'group' && layer.children) {
          processLayers(layer.children);
        }
      });
    };
    
    processLayers(svgLayers);
    
    if (styleElement) {
      styleElement.textContent = cssString;
    }
    
    return new XMLSerializer().serializeToString(svgDoc);
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
