import React, { useState, useEffect } from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import ElementRenderer from './ElementRenderer';
import { Element } from '../types/template';
import CanvasCalculationService from '../services/canvasCalculationService';
import ElementManagementService from '../services/elementManagementService';

interface GroupContainerProps {
  group: Element;
}

const GroupContainer: React.FC<GroupContainerProps> = ({ group }) => {
  const {
    elements,
    selectedElementIds,
    selectElement,
    updateElement,
    updateElements,
    openContextMenu,
    canvasRef
  } = useDesigner();

  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });

  const isSelected = selectedElementIds.includes(group.id);
  const childElements = elements.filter(el => el.parentId === group.id);

  const handleGroupMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    // Only handle clicks on the group container itself, not on child elements
    if (e.target !== e.currentTarget) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectElement(group, isMultiSelect);

    // Start dragging
    setIsDragging(true);
    
    if (canvasRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(group, e.clientX, e.clientY);
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, handle: string) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
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

  // Mouse move and mouse up effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      const canvasCoords = CanvasCalculationService.screenToCanvas(
        e.clientX,
        e.clientY,
        canvasRef.current
      );
      
      if (isDragging) {
        let newX = canvasCoords.x - dragOffset.x;
        let newY = canvasCoords.y - dragOffset.y;
        
        // Apply snapping if needed
        const tempGroup = {
          ...group,
          style: { ...group.style, x: newX, y: newY }
        };
        
        const otherElements = elements.filter(el => el.id !== group.id && !el.parentId);
        const snapGuides = CanvasCalculationService.calculateSnapGuides?.(
          tempGroup,
          otherElements
        );
        
        if (snapGuides?.snappedPosition) {
          newX = snapGuides.snappedPosition.x;
          newY = snapGuides.snappedPosition.y;
        }
        
        const groupEl = document.querySelector(`[data-element-id="${group.id}"]`);
        if (groupEl) {
          (groupEl as HTMLElement).style.left = `${newX}px`;
          (groupEl as HTMLElement).style.top = `${newY}px`;
        }
      } else if (isResizing && resizeHandle) {
        const newBounds = CanvasCalculationService.calculateResizeConstraints?.(
          group,
          resizeHandle,
          canvasCoords,
          initialSize,
          initialMousePosition,
          { width: 100, height: 100 }
        );
        
        if (newBounds) {
          const groupEl = document.querySelector(`[data-element-id="${group.id}"]`);
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
      if ((!isDragging && !isResizing)) return;

      const groupEl = document.querySelector(`[data-element-id="${group.id}"]`);
      if (groupEl && canvasRef.current) {
        const rect = groupEl.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        const finalX = rect.left - canvasRect.left;
        const finalY = rect.top - canvasRect.top;
        const finalWidth = rect.width;
        const finalHeight = rect.height;
        
        // Calculate scale factors for child elements if resizing
        if (isResizing) {
          const scaleX = finalWidth / (typeof group.style.width === 'number' ? 
            group.style.width : parseFloat(group.style.width as string));
          const scaleY = finalHeight / (typeof group.style.height === 'number' ? 
            group.style.height : parseFloat(group.style.height as string));
          
          // Update child elements
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

          const allUpdatedElements = ElementManagementService.updateElements(
            elements,
            [updatedGroup, ...updatedChildren]
          );
          
          updateElements(allUpdatedElements);
        } else {
          // Just dragging - update group position
          const updatedGroup = {
            ...group,
            style: {
              ...group.style,
              x: finalX,
              y: finalY
            }
          };
          
          updateElement(updatedGroup);
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };
    
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle, dragOffset, initialSize, initialPosition, initialMousePosition, group, elements, childElements, updateElement, updateElements]);

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
        key={`${group.id}-${handle.position}`}
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

  return (
    <div
      data-element-id={group.id}
      data-element-type="group"
      style={{
        position: 'absolute',
        left: `${group.style.x}px`,
        top: `${group.style.y}px`,
        width: typeof group.style.width === 'string' ? group.style.width : `${group.style.width}px`,
        height: typeof group.style.height === 'string' ? group.style.height : `${group.style.height}px`,
        border: isSelected ? '1px dashed #3498db' : '1px dashed rgba(0,0,0,0.2)',
        backgroundColor: 'rgba(52, 152, 219, 0.05)',
        boxSizing: 'border-box',
        zIndex: group.style.zIndex,
        cursor: isDragging ? 'grabbing' : 'grab',
        pointerEvents: 'all'
      }}
      onMouseDown={handleGroupMouseDown}
      onContextMenu={handleContextMenu}
    >
      {/* Render all child elements */}
      {childElements.map((element) => (
        <ElementRenderer 
          key={element.id} 
          element={element}
          isInGroup={true}
        />
      ))}
      
      {/* Render resize handles */}
      {renderResizeHandles()}
      
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

export default GroupContainer;
