
import React, { useRef, useState, useEffect } from 'react';
import { useAnimation, Keyframe } from '../context/AnimationContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const Timeline = () => {
  const {
    timeline,
    setTimeline,
    svgLayers,
    selectedLayerId,
    togglePlayback
  } = useAnimation();
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  
  // Find keyframes for the selected layer
  const selectedLayer = svgLayers.find(layer => layer.id === selectedLayerId);
  const keyframes = selectedLayer ? selectedLayer.keyframes : [];
  
  // Format time in seconds
  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  };
  
  // Calculate position for a keyframe
  const getKeyframePosition = (time: number) => {
    return (time / timeline.duration) * 100;
  };
  
  // Handle time scrubbing
  const handleTimeChange = (value: number[]) => {
    setTimeline({ ...timeline, currentTime: value[0] });
  };
  
  // Change playback state
  const handlePlayPause = () => {
    togglePlayback();
  };
  
  const handleRewind = () => {
    setTimeline({ ...timeline, currentTime: 0 });
  };
  
  // Add ticks for the timeline
  const renderTicks = () => {
    const ticks = [];
    const tickCount = 10; // Number of second markers
    const interval = timeline.duration / tickCount;
    
    for (let i = 0; i <= tickCount; i++) {
      const time = i * interval;
      const position = getKeyframePosition(time);
      
      ticks.push(
        <div
          key={`tick-${i}`}
          className="absolute h-8 flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="timeline-tick" />
          <span className="text-xs text-gray-500 mt-1">{formatTime(time)}</span>
        </div>
      );
    }
    
    return ticks;
  };
  
  // Render keyframes for the selected layer
  const renderKeyframes = () => {
    return keyframes.map(keyframe => (
      <div
        key={keyframe.id}
        className="timeline-keyframe absolute top-2"
        style={{ left: `calc(${getKeyframePosition(keyframe.time)}% - 3px)` }}
        title={`Keyframe at ${formatTime(keyframe.time)}`}
      />
    ));
  };
  
  return (
    <div className="animation-panel rounded-lg p-3 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            {timeline.playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={handleRewind}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{formatTime(timeline.currentTime)}</span>
        </div>
      </div>
      
      <div className="relative flex-grow flex flex-col overflow-hidden" ref={timelineRef}>
        <div className="relative h-8 min-h-8">
          {renderTicks()}
          {selectedLayerId && renderKeyframes()}
        </div>
        
        <Slider
          value={[timeline.currentTime]}
          min={0}
          max={timeline.duration}
          step={1}
          onValueChange={handleTimeChange}
          className="mt-2"
        />
        
        <div className="flex-grow"></div>
      </div>
    </div>
  );
};

export default Timeline;
