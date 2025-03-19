import React, { useState, useEffect } from 'react';
import { useAnimation } from '../context/AnimationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Settings, Plus } from 'lucide-react';
import { animatableProperties, defaultProperties } from '../utils/animationUtils';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const PropertiesPanel = () => {
  const {
    svgLayers,
    selectedLayerId,
    updateLayer,
    addKeyframe,
    timeline
  } = useAnimation();
  
  const [properties, setProperties] = useState(defaultProperties);
  
  const selectedLayer = svgLayers.find(layer => layer.id === selectedLayerId);
  
  useEffect(() => {
    if (selectedLayer) {
      setProperties({ ...defaultProperties, ...selectedLayer.properties });
    } else {
      setProperties(defaultProperties);
    }
  }, [selectedLayer]);
  
  const handlePropertyChange = (property: string, value: any) => {
    const updatedProperties = { ...properties, [property]: value };
    setProperties(updatedProperties);
    
    if (selectedLayerId) {
      updateLayer(selectedLayerId, { properties: updatedProperties });
    }
  };
  
  const handleAddKeyframe = () => {
    if (!selectedLayerId) return;
    
    addKeyframe(selectedLayerId, timeline.currentTime, properties);
    toast.success('Keyframe added');
  };
  
  const renderPropertyInput = (property: any) => {
    const value = properties[property.id] ?? defaultProperties[property.id as keyof typeof defaultProperties];
    
    switch (property.type) {
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={value ?? '#000000'}
              onChange={(e) => handlePropertyChange(property.id, e.target.value)}
              className="w-12 h-8 p-0.5 border rounded cursor-pointer"
            />
            <Input
              type="text"
              value={value ?? ''}
              onChange={(e) => handlePropertyChange(property.id, e.target.value)}
              className="h-8 py-0 flex-1"
            />
          </div>
        );
        
      case 'number':
        const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value ?? 0;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{property.min}</span>
              <Input
                type="number"
                value={value ?? 0}
                min={property.min}
                max={property.max}
                step={property.step}
                onChange={(e) => handlePropertyChange(property.id, parseFloat(e.target.value))}
                className="h-6 py-0 w-16 text-center mx-1"
              />
              <span className="text-xs text-gray-500">{property.max}</span>
            </div>
            <Slider
              value={[numericValue]}
              min={property.min}
              max={property.max}
              step={property.step}
              onValueChange={(values) => handlePropertyChange(property.id, values[0])}
            />
          </div>
        );
        
      default:
        return (
          <Input
            type="text"
            value={value ?? ''}
            onChange={(e) => handlePropertyChange(property.id, e.target.value)}
            className="h-8 py-0"
          />
        );
    }
  };
  
  return (
    <div className="animation-panel h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center shrink-0">
        <Settings className="h-4 w-4 mr-2 text-gray-500" />
        <h3 className="text-sm font-medium">Properties</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          {selectedLayerId ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-2 rounded border border-gray-100">
                <p className="text-xs font-medium mb-1">Selected Layer</p>
                <p className="text-sm">{selectedLayer?.name}</p>
              </div>
              
              <div className="space-y-3">
                {animatableProperties.map((property) => (
                  <div key={property.id} className="space-y-1.5">
                    <Label className="text-xs font-medium">{property.label}</Label>
                    {renderPropertyInput(property)}
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleAddKeyframe} 
                size="sm" 
                className="w-full mt-4 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Keyframe at Current Time
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Settings className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No layer selected</p>
              <p className="text-xs">Select a layer to edit properties</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PropertiesPanel;
