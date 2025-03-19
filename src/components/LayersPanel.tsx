import React, { useState, useRef, useEffect } from 'react';
import { useAnimation, SVGLayer } from '../context/AnimationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Code, Folder, FolderOpen, Edit, Eye, EyeOff, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const LayersPanel = () => {
  const {
    svgLayers,
    selectedLayerId,
    setSelectedLayerId,
    highlightedLayerId,
    setHighlightedLayerId,
    viewMode,
    setViewMode,
    renameLayer,
    groupLayers,
    ungroupLayers,
    svgContent,
    generateAnimatedSVG
  } = useAnimation();
  
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [layerName, setLayerName] = useState<string>('');
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const editInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (editingLayerId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingLayerId]);
  
  const getAnimatedSvgCode = () => {
    if (!svgContent) return '';
    if (svgLayers.length === 0) return svgContent;
    
    return generateAnimatedSVG();
  };
  
  const handleLayerClick = (layerId: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      if (selectedLayers.includes(layerId)) {
        setSelectedLayers(selectedLayers.filter(id => id !== layerId));
      } else {
        setSelectedLayers([...selectedLayers, layerId]);
      }
    } else {
      setSelectedLayerId(layerId);
      setSelectedLayers(layerId ? [layerId] : []);
    }
  };
  
  const handleLayerDoubleClick = (layer: SVGLayer) => {
    setEditingLayerId(layer.id);
    setLayerName(layer.name);
  };
  
  const handleLayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLayerName(e.target.value);
  };
  
  const handleLayerNameSave = () => {
    if (editingLayerId && layerName.trim()) {
      renameLayer(editingLayerId, layerName.trim());
      toast.success(`Layer renamed to "${layerName.trim()}"`);
    }
    setEditingLayerId(null);
  };
  
  const handleLayerNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLayerNameSave();
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
    }
  };
  
  const handleGroupLayers = () => {
    if (selectedLayers.length < 2) {
      toast.error('Select at least two layers to group');
      return;
    }
    
    const groupName = `Group ${Math.floor(Math.random() * 1000)}`;
    groupLayers(selectedLayers, groupName);
    setSelectedLayers([]);
    toast.success('Layers grouped successfully');
  };
  
  const handleUngroupLayers = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    ungroupLayers(groupId);
    toast.success('Group ungrouped successfully');
  };
  
  const toggleGroupExpand = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (expandedGroups.includes(groupId)) {
      setExpandedGroups(expandedGroups.filter(id => id !== groupId));
    } else {
      setExpandedGroups([...expandedGroups, groupId]);
    }
  };
  
  const renderLayer = (layer: SVGLayer, depth: number = 0) => {
    const isEditing = editingLayerId === layer.id;
    const isSelected = selectedLayerId === layer.id || selectedLayers.includes(layer.id);
    const isGroup = layer.type === 'group';
    const isExpanded = isGroup && expandedGroups.includes(layer.id);
    
    return (
      <div key={layer.id} className="select-none">
        <div
          className={`layer-item flex items-center py-1.5 px-2 ${
            isSelected ? 'bg-primary/10 border-primary/30' : ''
          }`}
          style={{ marginLeft: `${depth * 12}px` }}
          onClick={(e) => handleLayerClick(layer.id, e)}
          onDoubleClick={() => handleLayerDoubleClick(layer)}
          onMouseEnter={() => setHighlightedLayerId(layer.id)}
          onMouseLeave={() => setHighlightedLayerId(null)}
        >
          {isGroup && (
            <button onClick={(e) => toggleGroupExpand(layer.id, e)} className="mr-1 text-gray-500 hover:text-gray-700">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          
          <span className="mr-2 text-gray-500">
            {isGroup ? <Folder className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          </span>
          
          {isEditing ? (
            <Input
              ref={editInputRef}
              type="text"
              value={layerName}
              onChange={handleLayerNameChange}
              onBlur={handleLayerNameSave}
              onKeyDown={handleLayerNameKeyDown}
              className="h-6 py-0 text-sm"
            />
          ) : (
            <span className="flex-1 truncate text-sm">{layer.name}</span>
          )}
          
          {isGroup && !isEditing && (
            <button
              onClick={(e) => handleUngroupLayers(layer.id, e)}
              className="ml-2 text-gray-400 hover:text-gray-700"
              title="Ungroup"
            >
              <FolderOpen className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        
        {isGroup && isExpanded && layer.children && (
          <div className="mt-1">
            {layer.children.map(child => renderLayer(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animation-panel h-full flex flex-col" data-panel="layers">
      <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'layers' | 'code')} className="w-full h-full flex flex-col">
        <div className="p-2 border-b border-gray-100 shrink-0">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="layers" className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              <span>Layers</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5" />
              <span>Code</span>
            </TabsTrigger>
          </TabsList>
        </div>
      
        <TabsContent value="layers" className="flex-1 overflow-hidden p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              {svgLayers.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Layers</h3>
                    {selectedLayers.length >= 2 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGroupLayers}
                        className="h-7 px-2 text-xs"
                      >
                        <Folder className="h-3.5 w-3.5 mr-1" />
                        Group
                      </Button>
                    )}
                  </div>
                  {svgLayers.map(layer => renderLayer(layer))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No layers available</p>
                  <p className="text-xs">Upload an SVG to see layers</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 overflow-hidden p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                {svgContent ? (
                  <code className="language-markup whitespace-pre-wrap">{getAnimatedSvgCode()}</code>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Code className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No SVG loaded</p>
                  </div>
                )}
              </pre>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LayersPanel;
