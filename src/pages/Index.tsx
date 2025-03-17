
import React from 'react';
import { AnimationProvider } from '../context/AnimationContext';
import Header from '../components/Header';
import SVGUpload from '../components/SVGUpload';
import LayersPanel from '../components/LayersPanel';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import Timeline from '../components/Timeline';
import { useAnimation } from '../context/AnimationContext';

// Wrap application content to access the animation context
const AnimationApp = () => {
  const { svgContent } = useAnimation();
  
  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      <Header />
      
      {!svgContent ? (
        <SVGUpload />
      ) : (
        <>
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
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
          
          <Timeline />
        </>
      )}
    </div>
  );
};

// Main component with provider
const Index = () => {
  return (
    <AnimationProvider>
      <div className="min-h-screen bg-gray-50">
        <AnimationApp />
      </div>
    </AnimationProvider>
  );
};

export default Index;
