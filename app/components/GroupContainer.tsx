import React, { useState, useRef, useEffect } from 'react';
import { Element } from '../types/template';
import ElementRenderer from './ElementRenderer';
import { GroupContainerProps } from '../types/template';

const GroupContainer: React.FC<GroupContainerProps> = ({
  group,
  elements,
  onSelect,
  isSelected,
  onUpdateElement,
  canvasRef,
  onContextMenu,
  onOpenStyleEditor,
  onSelectGroupElement,
  selectedElementIds
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Handle mouse down for dragging the group
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only respond to left mouse button (button 0)
    if (e.button !== 0) return;
    
    // If clicking directly on the group container (not a child element)
    if (e.currentTarget === e.target) {
      e.preventDefault();
      e.stopPropagation();
      
      // Select the group
      onSelect(e);
      
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
    }
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current || !isDragging) return;
    
    // Get canvas position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate new position relative to the canvas
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Update group position in real-time
    if (groupRef.current) {
      groupRef.current.style.left = `${newX}px`;
      groupRef.current.style.top = `${newY}px`;
    }
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    if (groupRef.current && canvasRef.current) {
      const rect = groupRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const finalX = rect.left - canvasRect.left;
      const finalY = rect.top - canvasRect.top;
      
      // Update the group with the new position
      const updatedGroup = {
        ...group,
        style: {
          ...group.style,
          x: finalX,
          y: finalY
        }
      };
      
      onUpdateElement(updatedGroup);
      
      // Update all child elements to maintain their relative positions
      elements.forEach(element => {
        // No need to update positions as they're relative to the group
        // But we need to trigger a re-render
        onUpdateElement(element);
      });
    }
    
    setIsDragging(false);
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Handle context menu (right-click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show context menu for this group
    onContextMenu(group, e.clientX, e.clientY);
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
      />
    ));
  };
  
  return (
    <div 
      ref={groupRef}
      style={{
        position: 'absolute',
        left: `${group.style.x}px`,
        top: `${group.style.y}px`,
        width: `${group.style.width}px`,
        height: `${group.style.height}px`,
        border: isSelected ? '1px dashed #3498db' : '1px dashed transparent',
        backgroundColor: 'transparent',
        zIndex: isDragging ? 1000 : group.style.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      data-element-id={group.id}
      data-element-type="group"
      className={`group-wrapper ${isDragging ? 'dragging' : ''}`}
    >
      {/* Render child elements */}
      {elements.map(element => (
        <ElementRenderer 
          key={element.id} 
          element={{
            ...element,
            style: {
              ...element.style,
              // Don't modify x and y as they're already relative to the group
            }
          }} 
          onSelect={(isMultiSelect?: boolean) => {
            // Event propagation is handled internally by ElementRenderer
            onSelectGroupElement(element, !!isMultiSelect);
          }}
          isSelected={selectedElementIds.includes(element.id)}
          onUpdateElement={(updatedElement) => {
            // Update the element, maintaining its relative position
            onUpdateElement(updatedElement);
          }}
          canvasRef={canvasRef}
          onContextMenu={(element, x, y) => {
            onContextMenu(element, x, y);
          }}
          onOpenStyleEditor={onOpenStyleEditor ? () => onOpenStyleEditor() : undefined}
          isInGroup={true}
        />
      ))}
      
      {renderResizeHandles()}
    </div>
  );
};

export default GroupContainer;
