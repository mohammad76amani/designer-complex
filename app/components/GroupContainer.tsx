import React, { useEffect, useRef, useState } from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import ElementRenderer from './ElementRenderer';
import { Element } from '../types/template';

interface GroupContainerProps {
  group: Element;
  childElements: Element[];
  onSelect: (isMultiSelect: boolean) => void;
  isSelected: boolean;
  onUpdateElement: (updatedElement: Element) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  onContextMenu: (element: Element, x: number, y: number) => void;
  onOpenStyleEditor: (element: Element) => void;
  selectedElementIds: string[];
  onSelectElement: (element: Element, isMultiSelect: boolean) => void;
}

const GroupContainer: React.FC<GroupContainerProps> = ({
  group,
  childElements,
  onSelect,
  isSelected,
  onUpdateElement,
  canvasRef,
  onContextMenu,
  onOpenStyleEditor,
  selectedElementIds,
  onSelectElement
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  
  // State for dragging and resizing
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  
  const handleGroupMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    // Only handle mouse down if it's directly on the group header
    if (!(e.target as HTMLElement).closest('.group-header')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select the group
    onSelect(e.shiftKey || e.ctrlKey || e.metaKey);
    
    // Start dragging
    setIsDragging(true);
    
    // Calculate the offset from the mouse position to the element's top-left corner
    if (groupRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // Handle mouse move for dragging or resizing
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Get canvas position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    if (isDragging) {
      // Calculate new position relative to the canvas
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Update group position in real-time
      if (groupRef.current) {
        groupRef.current.style.left = `${newX}px`;
        groupRef.current.style.top = `${newY}px`;
      }
    } else if (isResizing && resizeHandle) {
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
      
      // Update group size and position in real-time
      if (groupRef.current) {
        groupRef.current.style.width = `${newWidth}px`;
        groupRef.current.style.height = `${newHeight}px`;
        groupRef.current.style.left = `${newX}px`;
        groupRef.current.style.top = `${newY}px`;
      }
    }
  };
  
  // Handle mouse up to end dragging or resizing
  const handleMouseUp = () => {
    if (!isDragging && !isResizing) return;
    
    if (groupRef.current && canvasRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const finalX = rect.left - canvasRect.left;
      const finalY = rect.top - canvasRect.top;
      const finalWidth = rect.width;
      const finalHeight = rect.height;
      
      // Update the group with the new position and size
      const updatedGroup = {
        ...group,
        style: {
          ...group.style,
          x: finalX,
          y: finalY,
          width: finalWidth,
          height: finalHeight
        }
      };
      
      // Update the group
      onUpdateElement(updatedGroup);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    // Only respond to left mouse button (button 0)
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    if (groupRef.current && canvasRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
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
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle]);
  
  // Handle context menu (right-click)
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only handle context menu if it's directly on the group (not on a child element)
    if (!(e.target as HTMLElement).closest('.group-header') && 
        !(e.target as HTMLElement).closest('.group-background')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectElement(group, isMultiSelect);
  };
  
  // Render resize handles
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
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
        key={handle.position}
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
        onMouseDown={(e) => handleResizeStart(e, handle.position)}
      />
    ));
  };
  
  // Handle group click (for selection)
  const handleGroupClick = (e: React.MouseEvent) => {
    // Only handle clicks directly on the group background (not on child elements)
    if (!(e.target as HTMLElement).closest('.group-background') && 
        !(e.target as HTMLElement).closest('.group-header')) {
      return;
    }
    
    e.stopPropagation();
    onSelect(e.shiftKey || e.ctrlKey || e.metaKey);
  };
  
  return (
    <>
      {/* Group container - just a visual indicator */}
      <div 
        ref={groupRef}
        style={{
          position: 'absolute',
          left: `${group.style.x}px`,
          top: `${group.style.y}px`,
          width: `${group.style.width}px`,
          height: `${group.style.height}px`,
          border: isSelected ? '1px dashed #3498db' : '1px dashed #ccc',
          backgroundColor: 'transparent',
          zIndex: isDragging || isResizing ? 1000 : group.style.zIndex,
          pointerEvents: 'none' // Make the container transparent to mouse events
        }}
        data-element-id={group.id}
        data-element-type="group"
        className={`group-wrapper ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      >
        {/* Group header bar */}
        <div 
          className="group-header"
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '24px',
            backgroundColor: isSelected ? 'rgba(52, 152, 219, 0.3)' : 'rgba(0, 0, 0, 0.1)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            fontSize: '12px',
            color: isSelected ? '#3498db' : '#666',
            userSelect: 'none',
            zIndex: 1000,
            pointerEvents: 'auto' // Enable pointer events
          }}
          onMouseDown={handleMouseDown}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e.shiftKey || e.ctrlKey || e.metaKey);
          }}
          onContextMenu={handleContextMenu}
        >
          <span>Group</span>
          <button
            style={{
              background: 'none',
              border: 'none',
              padding: '2px 6px',
              fontSize: '10px',
              color: '#666',
              cursor: 'pointer',
              borderRadius: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(false); // Select the group itself
              onOpenStyleEditor(group); // Open style editor for the group
            }}
          >
            Edit Group
          </button>
        </div>
        
        {renderResizeHandles()}
      </div>
      
      {/* Render child elements separately from the group container */}
      {childElements.map(element => (
        <ElementRenderer
          key={element.id}
          element={element}
          onSelect={(isMultiSelect) => onSelectElement(element, isMultiSelect)}
          isSelected={selectedElementIds.includes(element.id)}
          onUpdateElement={onUpdateElement}
          canvasRef={canvasRef}
          onContextMenu={onContextMenu}
          onOpenStyleEditor={() => onOpenStyleEditor(element)}
          isInGroup={false} // Don't mark as in group to allow normal interaction
        />
      ))}
    </>
  );
};

export default GroupContainer;
