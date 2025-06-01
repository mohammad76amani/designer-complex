import React, { useState, useEffect, useCallback } from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import ElementRenderer from './ElementRenderer';
import FloatingGroupButton from './FloatingGroupButton';
import { Element } from '../types/template';
import ElementManagementService from '../services/elementManagementService';
import CanvasCalculationService from '../services/canvasCalculationService';
import GroupContainer from './GroupContainer';

const CanvasRenderer: React.FC = () => {
  const {
    elements,
    selectedElementIds,
    canvasRef,
    currentBreakpoint,
    breakpoints,
    canvasHeight, // Now from context
    setCanvasHeight, // Add this
    selectElement,
    updateElement,
    updateElements,
    openContextMenu,
    closeContextMenu
  } = useDesigner();

  // Canvas height resize state
  const [isResizingCanvasHeight, setIsResizingCanvasHeight] = useState<boolean>(false);
  const [initialCanvasHeight, setInitialCanvasHeight] = useState<number>(0);
  const [initialCanvasMouseY, setInitialCanvasMouseY] = useState<number>(0);
  
  // Get canvas settings from context
  const canvasWidth = breakpoints[currentBreakpoint];

  const canvasStyle: React.CSSProperties = {
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid #dee2e6',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'width 0.3s ease-in-out',
  };

  // Handle canvas height resize start
  const handleCanvasHeightResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Starting canvas height resize'); // Debug log
    
    setIsResizingCanvasHeight(true);
    setInitialCanvasHeight(canvasHeight);
    setInitialCanvasMouseY(e.clientY);
  };

  // Handle canvas height resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingCanvasHeight) return;
      
      const deltaY = e.clientY - initialCanvasMouseY;
      const newHeight = Math.max(200, initialCanvasHeight + deltaY); // Min height of 200px
      
      console.log('Resizing canvas height:', newHeight); // Debug log
      
      // Update canvas height visually
      if (canvasRef.current) {
        canvasRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isResizingCanvasHeight) return;
      
      const deltaY = e.clientY - initialCanvasMouseY;
      const newHeight = Math.max(200, initialCanvasHeight + deltaY);
      
      console.log('Finished resizing canvas height:', newHeight); // Debug log
      
      // Update the canvas height in context
      setCanvasHeight(newHeight);
      
      setIsResizingCanvasHeight(false);
    };

    if (isResizingCanvasHeight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingCanvasHeight, initialCanvasHeight, initialCanvasMouseY, setCanvasHeight, canvasRef]);

  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      openContextMenu(null, e.clientX, e.clientY);
    }
  };
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeContextMenu();
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        selectElement(null);
      }
    }
  };
  
  // Render a group element
const renderGroup = (groupElement: Element) => {
  return (
    <GroupContainer 
      key={groupElement.id} 
      group={groupElement}
    />
  );
};
  
  // Filter elements to get top-level elements (not in any group)
  const topLevelElements = ElementManagementService.getTopLevelElements(elements);
  
  // Add grid rendering component
  const renderGrid = () => {
    const showGrid = true; // This should come from canvas settings
    const gridSize = 20; // This should come from canvas settings
    
    if (!showGrid || !canvasRef.current) return null;
    
    const gridLines = CanvasCalculationService.calculateGridLines(
      { width: canvasWidth, height: canvasHeight },
      gridSize
    );
    
   
  };

  // Render canvas size indicator
  const renderCanvasSizeIndicator = () => {
    const breakpointLabel = currentBreakpoint === 'sm' ? 'Mobile' : 'Desktop';
    const breakpointColor = currentBreakpoint === 'sm' ? '#dc3545' : '#28a745';
    
    return (
      <div
        style={{
          position: 'absolute',
          top: '-35px',
          left: '0',
          backgroundColor: breakpointColor,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px 4px 0 0',
          fontSize: '11px',
          fontWeight: '600',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        {breakpointLabel} ({canvasWidth}×{canvasHeight})
      </div>
    );
  };

  // Render canvas height resize handle
  const renderCanvasHeightResizeHandle = () => {
    const resizable = true; // This should come from canvas settings
    
    if (!resizable) return null;
    
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '10px',
          backgroundColor: '#6c757d',
          borderRadius: '5px',
          cursor: 'ns-resize',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseDown={handleCanvasHeightResizeStart}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
        title="Drag to resize canvas height"
      >
        <div style={{
          width: '20px',
          height: '2px',
          backgroundColor: 'white',
          borderRadius: '1px'
        }} />
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', margin: '40px 20px 20px 20px' }}>
      {/* Canvas size indicator */}
      {renderCanvasSizeIndicator()}
      
      <div 
        className="canvas" 
        style={canvasStyle}
        data-grid-size={20}
        data-show-grid={true}
        data-canvas-width={currentBreakpoint}
        data-breakpoint={currentBreakpoint}
        ref={canvasRef}
        onContextMenu={handleCanvasContextMenu}
        onClick={handleCanvasClick}
      >
        {renderGrid()}
        {/* Render top-level elements */}
        {topLevelElements.map((element) => {
          // Render groups differently
          if (element.type === 'group') {
            return renderGroup(element);
          }
          
          // Render regular elements
          return (
            <ElementRenderer 
              key={element.id} 
              element={element}
              isInGroup={false}
            />
          );
        })}

        {/* Add the floating group button */}
        <FloatingGroupButton />
      </div>
      
      {/* Canvas height resize handle */}
      {renderCanvasHeightResizeHandle()}
    </div>
  );
};

export default CanvasRenderer;
