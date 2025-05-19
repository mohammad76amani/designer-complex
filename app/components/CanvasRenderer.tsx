import React, { useRef, useState, useEffect } from 'react';
import ElementRenderer from './ElementRenderer';
import { CanvasRendererProps, Element } from '../types/template';

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ 
  blocks, 
  onSelectElement,
  selectedElementId,
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
  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [isResizingGroup, setIsResizingGroup] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  
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
  
  // Handle canvas click to close context menu and clear selection if not multi-selecting
  const handleCanvasClick = (e: React.MouseEvent) => {
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
  const handleGroupMouseDown = (e: React.MouseEvent, groupId: string, groupElement: Element) => {
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
  const handleGroupResizeStart = (e: React.MouseEvent, handle: string, groupId: string, groupElement: Element) => {
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
          height: rect.height
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
      
      // Get canvas position
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Find the active group element
      const groupElement = elements.find(el => el.id === activeGroupId);
      if (!groupElement) return;
      
      if (isDraggingGroup) {
        // Calculate new position relative to the canvas
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;
        
        // Find the group element in the DOM
        const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
        if (groupEl) {
          // Update group position in real-time
          (groupEl as HTMLElement).style.left = `${newX}px`;
          (groupEl as HTMLElement).style.top = `${newY}px`;
        }
      } else if (isResizingGroup && resizeHandle) {
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;
        const deltaX = mouseX - initialMousePosition.x;
        const deltaY = mouseY - initialMousePosition.y;
        
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newX = initialPosition.x;
        let newY = initialPosition.y;
        
        // Handle different resize directions
        switch (resizeHandle) {
          case 'e': // East (right)
            newWidth = Math.max(50, initialSize.width + deltaX);
            break;
          case 'w': // West (left)
            newWidth = Math.max(50, initialSize.width - deltaX);
            newX = initialPosition.x + deltaX;
            break;
          case 's': // South (bottom)
            newHeight = Math.max(50, initialSize.height + deltaY);
            break;
          case 'n': // North (top)
            newHeight = Math.max(50, initialSize.height - deltaY);
            newY = initialPosition.y + deltaY;
            break;
          case 'se': // Southeast (bottom-right)
            newWidth = Math.max(50, initialSize.width + deltaX);
            newHeight = Math.max(50, initialSize.height + deltaY);
            break;
          case 'sw': // Southwest (bottom-left)
            newWidth = Math.max(50, initialSize.width - deltaX);
            newHeight = Math.max(50, initialSize.height + deltaY);
            newX = initialPosition.x + deltaX;
            break;
          case 'ne': // Northeast (top-right)
            newWidth = Math.max(50, initialSize.width + deltaX);
            newHeight = Math.max(50, initialSize.height - deltaY);
            newY = initialPosition.y + deltaY;
            break;
          case 'nw': // Northwest (top-left)
            newWidth = Math.max(50, initialSize.width - deltaX);
            newHeight = Math.max(50, initialSize.height - deltaY);
            newX = initialPosition.x + deltaX;
            newY = initialPosition.y + deltaY;
            break;
        }
        
        // Find the group element in the DOM
        const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
        if (groupEl) {
          // Update group size and position in real-time
          (groupEl as HTMLElement).style.width = `${newWidth}px`;
          (groupEl as HTMLElement).style.height = `${newHeight}px`;
          (groupEl as HTMLElement).style.left = `${newX}px`;
          (groupEl as HTMLElement).style.top = `${newY}px`;
        }
      }
    };
    
    const handleMouseUp = () => {
      if ((!isDraggingGroup && !isResizingGroup) || !activeGroupId) {
        resetGroupState();
        return;
      }
      
      // Find the active group element
      const groupElement = elements.find(el => el.id === activeGroupId);
      if (!groupElement) {
        resetGroupState();
        return;
      }
      
      // Find the group element in the DOM
      const groupEl = document.querySelector(`[data-element-id="${activeGroupId}"]`);
      if (groupEl && canvasRef.current) {
        const rect = groupEl.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        const finalX = rect.left - canvasRect.left;
        const finalY = rect.top - canvasRect.top;
        const finalWidth = rect.width;
        const finalHeight = rect.height;
        
        // Calculate position change
        const deltaX = finalX - groupElement.style.x;
        const deltaY = finalY - groupElement.style.y;
        
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
        const finalElements = updatedElements.map(el => 
          el.id === activeGroupId ? updatedGroup : el
        );
        
        // Update elements state
        if (onUpdateElements) {
          onUpdateElements(finalElements);
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
        onMouseDown={(e) => handleGroupResizeStart(e, handle.position, groupId, groupElement)}
      />
    ));
  };
  
  // Render a group element
  const renderGroup = (groupElement: Element) => {
    const { id, style, childIds = [] } = groupElement;
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
            onSelect={() => onSelectElement(element, false)}
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
  const topLevelElements = elements.filter(el => !el.parentId);
  
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
