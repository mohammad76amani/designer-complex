import React, { useState, useEffect, useCallback } from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import ElementRenderer from './ElementRenderer';
import FloatingGroupButton from './FloatingGroupButton';
import { Element } from '../types/template';
import ElementManagementService from '../services/elementManagementService';
import CanvasCalculationService from '../services/canvasCalculationService';

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

  // Local state for group operations
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isDraggingGroup, setIsDraggingGroup] = useState<boolean>(false);
  const [isResizingGroup, setIsResizingGroup] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<{ width: number; height: number; x: number; y: number }>({ width: 0, height: 0, x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
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
  
  // Handle group mouse down
  const handleGroupMouseDown = (e: React.MouseEvent<HTMLDivElement>, groupId: string, groupElement: Element) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectElement(groupElement, isMultiSelect);
    
    setActiveGroupId(groupId);
    setIsDraggingGroup(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Handle group resize start
  const handleGroupResizeStart = (e: React.MouseEvent<HTMLDivElement>, handle: string, groupId: string) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setActiveGroupId(groupId);
    setIsResizingGroup(true);
    setResizeHandle(handle);
    
    if (canvasRef.current) {
      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      if (rect) {
        setInitialSize({
          width: rect.width,
          height: rect.height,
          x: rect.left - canvasRect.left,
          y: rect.top - canvasRect.top
        });
        
        setInitialPosition({
          x: rect.left - canvasRect.left,
          y: rect.top - canvasRect.top
        });
        
        setInitialMousePosition({
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top
        });
      }
    }
  };
  
  // Handle mouse move for group dragging/resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !activeGroupId) return;
      
      const canvasCoords = CanvasCalculationService.screenToCanvas(
        e.clientX,
        e.clientY,
        canvasRef.current
      );
      
      if (isDraggingGroup) {
        let newX = canvasCoords.x - dragOffset.x;
        let newY = canvasCoords.y - dragOffset.y;
        
        const groupElement = elements.find(el => el.id === activeGroupId);
        if (groupElement) {
          const tempGroup = {
            ...groupElement,
            style: { ...groupElement.style, x: newX, y: newY }
          };
          
          const otherElements = elements.filter(el => el.id !== activeGroupId && !el.parentId);
          const snapGuides = CanvasCalculationService.calculateSnapGuides(
            tempGroup,
            otherElements
          );
          
          if (snapGuides.snappedPosition) {
            newX = snapGuides.snappedPosition.x;
            newY = snapGuides.snappedPosition.y;
          }
        }
        
        const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
        if (groupEl) {
          (groupEl as HTMLElement).style.left = `${newX}px`;
          (groupEl as HTMLElement).style.top = `${newY}px`;
        }
      } else if (isResizingGroup && resizeHandle) {
        const groupElement = elements.find(el => el.id === activeGroupId);
        if (groupElement) {
          const newBounds = CanvasCalculationService.calculateResizeConstraints(
            groupElement,
            resizeHandle,
            canvasCoords,
            initialSize,
            initialMousePosition,
            { width: 100, height: 100 }
          );
          
          const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
          if (groupEl) {
            (groupEl as HTMLElement).style.width = `${newBounds.width}px`;
            (groupEl as HTMLElement).style.height = `${newBounds.height}px`;
            (groupEl as HTMLElement).style.left = `${newBounds.x}px`;
            (groupEl as HTMLElement).style.top = `${newBounds.y}px`;
          }
        }
      }
    };
    
    const handleMouseUp = () => {
      if ((!isDraggingGroup && !isResizingGroup) || !activeGroupId) {
        resetGroupState();
        return;
      }

      const groupElement = ElementManagementService.findElementById(elements, activeGroupId);
      if (!groupElement) {
        resetGroupState();
        return;
      }

      const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
      if (groupEl && canvasRef.current) {
        const rect = groupEl.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        const finalX = rect.left - canvasRect.left;
        const finalY = rect.top - canvasRect.top;
        const finalWidth = rect.width;
        const finalHeight = rect.height;
        
      
        // Calculate scale factors for child elements
        const scaleX = finalWidth / (typeof groupElement.style.width === 'number' ? 
          groupElement.style.width : parseFloat(groupElement.style.width as string));
        const scaleY = finalHeight / (typeof groupElement.style.height === 'number' ? 
          groupElement.style.height : parseFloat(groupElement.style.height as string));
        
        // Update the group with the new position and size
        const updatedGroup = {
          ...groupElement,
          style: {
            ...groupElement.style,
            x: finalX,
            y: finalY,
            width: finalWidth,
            height: finalHeight
          }
        };
        // Update all child elements to maintain their relative positions
        const updatedElements = elements.map(el => {
          if (el.parentId === activeGroupId) {
            // If resizing, scale the element's position and size
            if (isResizingGroup) {
              // Calculate new position based on scale factors
              const newX = el.style.x * scaleX;
              const newY = el.style.y * scaleY;
              
              // Calculate new size based on scale factors
              const newWidth = typeof el.style.width === 'number' 
                ? el.style.width * scaleX 
                : parseFloat(el.style.width as string) * scaleX;
              
              const newHeight = typeof el.style.height === 'number' 
                ? el.style.height * scaleY 
                : parseFloat(el.style.height as string) * scaleY;
              
              return {
                ...el,
                style: {
                  ...el.style,
                  x: newX,
                  y: newY,
                  width: newWidth,
                  height: newHeight
                }
              };
            } 
            // If dragging, just move the element with the group
            else if (isDraggingGroup) {
              return el; // Position is relative to group, no need to change
            }
          }
          return el;
        });
        
        // Update the elements array with the updated group and child elements
       
        if (isResizingGroup) {
          const scaleX = finalWidth / (typeof groupElement.style.width === 'number' ? 
            groupElement.style.width : parseFloat(groupElement.style.width as string));
          const scaleY = finalHeight / (typeof groupElement.style.height === 'number' ? 
            groupElement.style.height : parseFloat(groupElement.style.height as string));

          const childElements = ElementManagementService.getChildElements(elements, activeGroupId);
          const updatedChildren = childElements.map(child => ({
            ...child,
            style: {
              ...child.style,
              x: child.style.x * scaleX,
              y: child.style.y * scaleY,
              width: (typeof child.style.width === 'number' ? child.style.width : parseFloat(child.style.width as string)) * scaleX,
              height: (typeof child.style.height === 'number' ? child.style.height : parseFloat(child.style.height as string)) * scaleY
            }
          }));

          const allUpdatedElements = ElementManagementService.updateElements(
            elements,
            [updatedGroup, ...updatedChildren]
          );
          
          updateElements(allUpdatedElements);
        } else {
          const updatedElements = ElementManagementService.updateElement(elements, updatedGroup);
          updateElements(updatedElements);
        }
      }

      resetGroupState();
    };

    const resetGroupState = () => {
      setActiveGroupId(null);
      setIsDraggingGroup(false);
      setIsResizingGroup(false);
      setResizeHandle(null);
    };
    
    if (isDraggingGroup || isResizingGroup) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingGroup, isResizingGroup, activeGroupId, resizeHandle, dragOffset, initialSize, initialPosition, initialMousePosition, elements, updateElements]);
  
  // Render resize handles for a group
  const renderGroupResizeHandles = (groupId: string, groupElement: Element) => {
    if (!selectedElementIds.includes(groupId)) return null;
    
    const handles = [
      { position: 'n', cursor: 'ns-resize', top: '-5px', left: '50%', width: '10px', height: '10px', transform: 'translateX(-50%)' },
      { position: 's', cursor: 'ns-resize', bottom: '-5px', left: '50%', width: '10px', height: '10px', transform: 'translateX(-50%)' },
      { position: 'e', cursor: 'ew-resize', right: '-5px', top: '50%', width: '10px', height: '10px', transform: 'translateY(-50%)' },
      { position: 'w', cursor: 'ew-resize', left: '-5px', top: '50%', width: '10px', height: '10px', transform: 'translateY(-50%)' },
      { position: 'ne', cursor: 'nesw-resize', top: '-5px', right: '-5px', width: '10px', height: '10px' },
      { position: 'nw', cursor: 'nwse-resize', top: '-5px', left: '-5px', width: '10px', height: '10px' },
      { position: 'se', cursor: 'nwse-resize', bottom: '-5px', right: '-5px', width: '10px', height: '10px' },
      { position: 'sw', cursor: 'nesw-resize', bottom: '-5px', left: '-5px', width: '10px', height: '10px' }
    ];
    
    return handles.map(handle => (
      <div
        key={`${groupId}-${handle.position}`}
        className="resize-handle"
        style={{
          position: 'absolute',
          width: handle.width,
          height: handle.height,
          top: handle.top,
          left: handle.left,
          right: handle.right,
          bottom: handle.bottom,
          transform: handle.transform,
          backgroundColor: '#3498db',
          borderRadius: '50%',
          cursor: handle.cursor,
          zIndex: 1001
        }}
        onMouseDown={(e) => handleGroupResizeStart(e, handle.position, groupId)}
      />
    ));
  };
  
  // Render a group element
  const renderGroup = (groupElement: Element) => {
    const { id, style } = groupElement;
    const isSelected = selectedElementIds.includes(id);
    
    const childElements = elements.filter(el => el.parentId === id);
    
    return (
      <div
        key={id}
        data-element-id={id}
        data-element-type="group"
        style={{
          position: 'absolute',
          left: `${style.x}px`,
          top: `${style.y}px`,
          width: typeof style.width === 'string' ? style.width : `${style.width}px`,
          height: typeof style.height === 'string' ? style.height : `${style.height}px`,
          border: isSelected ? '1px dashed #3498db' : '1px dashed rgba(0,0,0,0.2)',
          backgroundColor: 'rgba(52, 152, 219, 0.05)',
          boxSizing: 'border-box',
          zIndex: style.zIndex,
          cursor: isDraggingGroup && activeGroupId === id ? 'grabbing' : 'grab',
          pointerEvents: 'all'
        }}
        onMouseDown={(e) => handleGroupMouseDown(e, id, groupElement)}
      >
        {childElements.map((element) => (
          <ElementRenderer 
            key={element.id} 
            element={element}
            isInGroup={true}
          />
        ))}
        
        {isSelected && renderGroupResizeHandles(id, groupElement)}
        
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              backgroundColor: '#3498db',
              color: 'white',
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '2px',
              pointerEvents: 'none'
            }}
          >
            Group
          </div>
        )}
      </div>
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
