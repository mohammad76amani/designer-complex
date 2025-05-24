import React, { useRef, useState, useEffect } from 'react';
import ElementRenderer from './ElementRenderer';
import { CanvasRendererProps, Element } from '../types/template';
import ElementManagementService from '../services/elementManagementService';
import CanvasCalculationService from '../services/canvasCalculationService';

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  blocks, 
  onSelectElement,
  selectedElementIds = [],
  onUpdateElement,
  onUpdateElements,
  onElementContextMenu,
  onCanvasContextMenu,
  onCloseContextMenu,
  canvasRef: externalCanvasRef,
  onOpenStyleEditor
}) => {
  const localCanvasRef = useRef<HTMLDivElement>(null);
  const canvasRef = (externalCanvasRef || localCanvasRef) as React.RefObject<HTMLDivElement>;
  
  // State for group dragging and resizing
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isDraggingGroup, setIsDraggingGroup] = useState<boolean>(false);
  const [isResizingGroup, setIsResizingGroup] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<{ width: number; height: number; x: number; y: number }>({ width: 0, height: 0, x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
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
  
  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Only handle direct right-clicks on the canvas, not on elements
    if (e.target === e.currentTarget && onCanvasContextMenu) {
      onCanvasContextMenu(e.clientX, e.clientY);
    }
  };
  
  // Handle canvas click to close context menu and clear selection if not multi-selecting
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle direct clicks on the canvas, not on elements
    if (e.target === e.currentTarget) {
      if (onCloseContextMenu) {
        onCloseContextMenu();
      }
      
      // Clear selection unless shift/ctrl is pressed for multi-select
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        onSelectElement(null);
      }
    }
  };
  
  // Handle group mouse down
  const handleGroupMouseDown = (e: React.MouseEvent<HTMLDivElement>, groupId: string, groupElement: Element) => {
    // Only respond to left mouse button (button 0)
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select the group
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    onSelectElement(groupElement, isMultiSelect);
    
    // Start dragging
    setActiveGroupId(groupId);
    setIsDraggingGroup(true);
    
    // Calculate the offset from the mouse position to the group's top-left corner
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Handle group resize start
  const handleGroupResizeStart = (e: React.MouseEvent<HTMLDivElement>, handle: string, groupId: string) => {
    // Only respond to left mouse button (button 0)
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
        
        // Apply snapping for groups
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
            { width: 100, height: 100 } // min group size
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

  // Get final position/size and update using service
  const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
  if (groupEl && canvasRef.current) {
    const rect = groupEl.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    const finalX = rect.left - canvasRect.left;
    const finalY = rect.top - canvasRect.top;
    const finalWidth = rect.width;
    const finalHeight = rect.height;

    // Use service to resize the group
    const updatedGroup = ElementManagementService.resizeElement(
      groupElement,
      { width: finalWidth, height: finalHeight },
      { x: finalX, y: finalY }
    );

    // Update child elements if resizing
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
      
      if (onUpdateElements) {
        onUpdateElements(allUpdatedElements);
      }
    } else {
      // Just update the group position
      const updatedElements = ElementManagementService.updateElement(elements, updatedGroup);
      if (onUpdateElements) {
        onUpdateElements(updatedElements);
      }
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
  }, [isDraggingGroup, isResizingGroup, activeGroupId, resizeHandle, dragOffset, initialSize, initialPosition, initialMousePosition, elements, onUpdateElements]);
  
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
    const { id, style,  } = groupElement;
    const isSelected = selectedElementIds.includes(id);
    
    // Find all child elements of this group
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
        {/* Render all child elements */}
        {childElements.map((element) => (
          <ElementRenderer 
            key={element.id} 
            element={element} 
            onSelect={(isMultiSelect) => onSelectElement(element, isMultiSelect)}
            isSelected={selectedElementIds.includes(element.id)}
            onUpdateElement={onUpdateElement}
            canvasRef={canvasRef}
            onContextMenu={onElementContextMenu}
            onOpenStyleEditor={onOpenStyleEditor ? () => onOpenStyleEditor(element) : undefined}
            isInGroup={true}
          />
        ))}
        
        {/* Render resize handles if selected */}
        {isSelected && renderGroupResizeHandles(id, groupElement)}
        
        {/* Group label */}
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
    if (!settings.showGrid || !canvasRef.current) return null;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const gridLines = CanvasCalculationService.calculateGridLines(
      { width: canvasRect.width, height: canvasRect.height },
      settings.gridSize || 20
    );
    
    return (
      <div className="canvas-grid" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        {/* Vertical lines */}
        {gridLines.vertical.map(x => (
          <div
            key={`v-${x}`}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: 'rgba(0,0,0,0.1)'
            }}
          />
        ))}
        {/* Horizontal lines */}
        {gridLines.horizontal.map(y => (
          <div
            key={`h-${y}`}
            style={{
              position: 'absolute',
              top: `${y}px`,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: 'rgba(0,0,0,0.1)'
            }}
          />
        ))}
      </div>
    );
  };



  return (
    <div 
      className="canvas" 
      style={canvasStyle}
      data-grid-size={settings.gridSize}
      data-show-grid={settings.showGrid}
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
            onSelect={(isMultiSelect) => onSelectElement(element, isMultiSelect)}
            isSelected={selectedElementIds.includes(element.id)}
            onUpdateElement={onUpdateElement}
            canvasRef={canvasRef}
            onContextMenu={onElementContextMenu}
            onOpenStyleEditor={onOpenStyleEditor ? () => onOpenStyleEditor(element) : undefined}
            isInGroup={false}
          />
        );
      })}
    </div>
  );
};

export default CanvasRenderer;
