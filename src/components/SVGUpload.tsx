
import React, { useRef, useState } from 'react';
import { useAnimation } from '../context/AnimationContext';
import { Button } from '@/components/ui/button';
import { parsePathElements } from '../utils/svgParser';
import { Upload, FileSymlink } from 'lucide-react';
import { toast } from 'sonner';

const SVGUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    setSvgContent,
    setSvgLayers,
    setSvgFile
  } = useAnimation();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processSVGFile(file);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const processSVGFile = (file: File) => {
    if (!file.type.includes('svg')) {
      toast.error('Please upload an SVG file');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const svgContent = e.target?.result as string;
        
        // Set the SVG content
        setSvgContent(svgContent);
        
        // Parse SVG layers
        const layers = parsePathElements(svgContent);
        setSvgLayers(layers);
        
        // Save reference to the file
        setSvgFile(file);
        
        toast.success('SVG loaded successfully');
      } catch (error) {
        console.error('SVG parsing error:', error);
        toast.error('Failed to parse SVG file');
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsText(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processSVGFile(file);
    }
  };
  
  return (
    <div
      className={`animation-panel flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors duration-300 ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-200'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ minHeight: '400px' }}
    >
      <FileSymlink className="h-16 w-16 text-gray-300 mb-4" />
      
      <h3 className="text-lg font-medium mb-2">Upload an SVG file</h3>
      
      <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
        Drag and drop your SVG file here, or click the button below to select a file
      </p>
      
      <Button onClick={handleButtonClick} className="gap-2">
        <Upload className="h-4 w-4" />
        <span>Select SVG File</span>
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".svg"
        className="hidden"
      />
    </div>
  );
};

export default SVGUpload;
