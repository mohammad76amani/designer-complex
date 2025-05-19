import React, { useRef, useEffect } from 'react';
import ElementRenderer from './ElementRenderer';
import { CanvasRendererProps } from '../types/template';
import { generateCanvasAnimationCSS, injectAnimationStyles } from '../utils/canvasAnimationUtils';

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  blocks, 
  onSelectElement,
  selectedElementId,
  onUpdateElement,
  onElementContextMenu,
  onCanvasContextMenu,
  onCloseContextMenu,
  canvasRef: externalCanvasRef,
  onOpenStyleEditor
}) => {  
  const localCanvasRef = useRef<HTMLDivElement>(null);
  const canvasRef = (externalCanvasRef || localCanvasRef) as React.RefObject<HTMLDivElement>;
  // Handle both setting and settings properties
  const settings = blocks.setting || blocks.settings;
  const { elements } = blocks;
  
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
  
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Only handle direct right-clicks on the canvas, not on elements
    if (e.target === e.currentTarget && onCanvasContextMenu) {
      onCanvasContextMenu(e.clientX, e.clientY);
    }
  };

  useEffect(() => {
    if (elements && elements.length > 0) {
      injectAnimationStyles(elements);
    }
    
    return () => {
      // Clean up styles when component unmounts
      const existingStyle = document.getElementById('canvas-animations');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [elements]);
  
  return (
    <div 
      className="canvas" 
      style={canvasStyle}
      data-grid-size={settings.gridSize}
      data-show-grid={settings.showGrid}
      ref={canvasRef}
      onContextMenu={handleCanvasContextMenu}
    >
      {elements.map((element) => (
        <ElementRenderer 
          key={element.id} 
          element={element} 
          onSelect={() => onSelectElement(element)}
          isSelected={element.id === selectedElementId}
          onUpdateElement={onUpdateElement}
          canvasRef={canvasRef}
          onContextMenu={onElementContextMenu}
          onOpenStyleEditor={onOpenStyleEditor ? () => onOpenStyleEditor(element) : undefined}
        />
      ))}
    </div>
  );
};

export default CanvasRenderer;
