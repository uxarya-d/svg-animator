
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
    <div className="w-full">
      <Header />
      
      {!svgContent ? (
        <SVGUpload />
      ) : (
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={80} minSize={30}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Layers Panel */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <LayersPanel />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                {/* Canvas */}
                <ResizablePanel defaultSize={60} minSize={40}>
                  <Canvas />
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                {/* Properties Panel */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <PropertiesPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
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
      <div className="h-screen w-full overflow-hidden">
        <AnimationApp />
      </div>
    </AnimationProvider>
  );
};

export default Index;
