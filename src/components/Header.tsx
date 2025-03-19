
import React from 'react';
import { useAnimation } from '../context/AnimationContext';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileCode } from 'lucide-react';
import { toast } from 'sonner';

const Header = () => {
  const { 
    svgFile, 
    generateAnimatedSVG, 
    resetWorkspace,
    setSvgFile,
    setSvgContent,
    setSvgLayers
  } = useAnimation();
  
  const handleExport = () => {
    try {
      const animatedSVG = generateAnimatedSVG();
      
      // Create a download link
      const blob = new Blob([animatedSVG], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = svgFile ? `animated-${svgFile.name}` : 'animated-svg.svg';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('SVG exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export SVG');
    }
  };
  
  const handleReset = () => {
    if (confirm('Reset workspace? All unsaved changes will be lost.')) {
      resetWorkspace();
      toast.info('Workspace reset');
    }
  };

  return (
    <header className="animation-panel flex items-center justify-between p-3 mb-0 h-16">
      <div className="flex items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-medium tracking-tight text-gray-900">SVG Animator</h1>
          <p className="text-xs text-gray-500">Animate your SVG with ease</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {svgFile && (
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        )}
        
        <Button onClick={handleReset} variant="outline" size="sm" className="gap-1">
          <FileCode className="h-4 w-4" />
          <span>New</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
