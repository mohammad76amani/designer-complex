import React, { useRef } from 'react';
import { Blocks, Element } from '../types/template';
import ElementRenderer from './ElementRenderer';

interface CanvasRendererProps {
  blocks: Blocks;
  onSelectElement: (element: Element) => void;
  selectedElementId?: string;
  onUpdateElement: (updatedElement: Element) => void;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  blocks, 
  onSelectElement,
  selectedElementId,
  onUpdateElement
}) => {
  // Handle both setting and settings properties
  const settings = blocks.setting || blocks.settings;
  const { elements } = blocks;
  const canvasRef = useRef<HTMLDivElement>(null);
  
  if (!settings) {
    console.error("No settings found in blocks");
    return null;
  }
  
  const canvasStyle: React.CSSProperties = {
    width: settings.canvasWidth,
    height: settings.canvasHeight,
    backgroundColor: settings.backgroundColor,
    position: 'relative',
    overflow: 'hidden',
  };
  
  return (
    <div 
      className="canvas" 
      style={canvasStyle}
      data-grid-size={settings.gridSize}
      data-show-grid={settings.showGrid}
      ref={canvasRef}
    >
      {elements.map((element) => (
        <ElementRenderer 
          key={element.id} 
          element={element} 
          onSelect={() => onSelectElement(element)}
          isSelected={element.id === selectedElementId}
          onUpdateElement={onUpdateElement}
          canvasRef={canvasRef}
        />
      ))}
    </div>
  );
};

export default CanvasRenderer;
