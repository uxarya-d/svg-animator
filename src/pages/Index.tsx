
import React from 'react';
import { AnimationProvider } from '../context/AnimationContext';
import Header from '../components/Header';
import SVGUpload from '../components/SVGUpload';
import LayersPanel from '../components/LayersPanel';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import Timeline from '../components/Timeline';
import { useAnimation } from '../context/AnimationContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

// Wrap application content to access the animation context
const AnimationApp = () => {
  const { svgContent } = useAnimation();
  
  return (
    <div className="w-full px-4">
      <Header />
      
      {!svgContent ? (
        <SVGUpload />
      ) : (
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <ResizablePanelGroup direction="vertical" className="min-h-0 flex-grow">
            <ResizablePanel defaultSize={80} minSize={30}>
              <div className="grid grid-cols-12 gap-4 h-full">
                {/* Layers Panel */}
                <div className="col-span-3 h-full">
                  <LayersPanel />
                </div>
                
                {/* Canvas */}
                <div className="col-span-6 h-full">
                  <Canvas />
                </div>
                
                {/* Properties Panel */}
                <div className="col-span-3 h-full">
                  <PropertiesPanel />
                </div>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={20} minSize={10}>
              <Timeline />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

// Main component with provider
const Index = () => {
  return (
    <AnimationProvider>
      <div className="min-h-screen bg-gray-50 w-full">
        <AnimationApp />
      </div>
    </AnimationProvider>
  );
};

export default Index;
