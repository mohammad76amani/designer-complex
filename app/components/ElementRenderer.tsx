import React, { useState, useRef, useEffect } from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import { Element } from '../types/template';
import ShapeElement from './elements/ShapeElement';
import ButtonElement from './elements/ButtonElement';
import HeadingElement from './elements/HeadingElement';
import ImageElement from './elements/ImageElement';
import ParagraphElement from './elements/ParagraphElement';
import VideoElement from './elements/VideoElement';
import ElementStyleService from '../services/elementStyleService';
import CanvasCalculationService from '../services/canvasCalculationService';

interface ElementRendererProps {
  element: Element;
  isInGroup?: boolean;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isInGroup = false
}) => {
  const {
    selectedElementIds,
    canvasRef,
    selectElement,
    updateElement,
    openContextMenu,
    openStyleEditor
  } = useDesigner();

  const { id, type, href, target } = element;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const isSelected = selectedElementIds.includes(id);

  // Generate element style using the service
  const elementStyle = ElementStyleService.generateElementStyle(element, {
    isSelected,
    isHovered,
    isActive,
    isDragging,
    isResizing,
    isInGroup
  });

  // Generate animation classes using the service
  const getAnimationClasses = (): string => {
    return ElementStyleService.getAnimationClasses(element, isActive);
  };

  // Event handlers for drag, resize, click, hover...
  const handleMouseDown = (e:React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    if (isInGroup) {
      e.stopPropagation();
      const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
      selectElement(element, isMultiSelect);
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectElement(element, isMultiSelect);
    
    setIsDragging(true);
    
    // Use service for coordinate conversion
    if (elementRef.current && canvasRef.current) {
      const canvasCoords = CanvasCalculationService.screenToCanvas(
        e.clientX, 
        e.clientY, 
        canvasRef.current
      );
      
      const elementBounds = CanvasCalculationService.getElementBounds(element);
      setDragOffset({
        x: canvasCoords.x - elementBounds.x,
        y: canvasCoords.y - elementBounds.y
      });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current || isInGroup) return;

    if (isDragging) {
      const canvasCoords = CanvasCalculationService.screenToCanvas(
        e.clientX, 
        e.clientY, 
        canvasRef.current
      );
      
      let newX = canvasCoords.x - dragOffset.x;
      let newY = canvasCoords.y - dragOffset.y;
      
      // Apply grid snapping if enabled
      const gridSize = 10; // Get from canvas settings
      const snappedPosition = CanvasCalculationService.snapToGrid(
        { x: newX, y: newY }, 
        gridSize
      );
      
      // Apply smart guides snapping
      const tempElement = {
        ...element,
        style: { ...element.style, x: snappedPosition.x, y: snappedPosition.y }
      };
      
      // Get other elements for snapping (you'll need to pass this from parent)
      const otherElements: Element[] = [];
      const snapGuides = CanvasCalculationService.calculateSnapGuides(
        tempElement,
        otherElements,
        5 // snap threshold
      );
      
      if (snapGuides.snappedPosition) {
        newX = snapGuides.snappedPosition.x;
        newY = snapGuides.snappedPosition.y;
      }
      
      if (elementRef.current) {
        elementRef.current.style.left = `${newX}px`;
        elementRef.current.style.top = `${newY}px`;
      }
    } else if (isResizing && resizeHandle) {
      const canvasCoords = CanvasCalculationService.screenToCanvas(
        e.clientX, 
        e.clientY, 
        canvasRef.current
      );
      
      // Use service for resize calculations
      const newBounds = CanvasCalculationService.calculateResizeConstraints(
        element,
        resizeHandle,
        canvasCoords,
        initialSize,
        initialMousePosition,
        { width: 20, height: 20 }, // min size
        element.type === 'image' ? 16/9 : undefined // aspect ratio for images
      );
      
      // Constrain to canvas
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const constrainedBounds = CanvasCalculationService.constrainToCanvas(
        newBounds,
        { width: canvasRect.width, height: canvasRect.height }
      );
      
      if (elementRef.current) {
        elementRef.current.style.width = `${constrainedBounds.width}px`;
        elementRef.current.style.height = `${constrainedBounds.height}px`;
        elementRef.current.style.left = `${constrainedBounds.x}px`;
        elementRef.current.style.top = `${constrainedBounds.y}px`;
      }
    }
  };

  // Handle mouse up to end dragging or resizing
  const handleMouseUp = () => {
    if ((!isDragging && !isResizing) || isInGroup) return;

    if (elementRef.current && canvasRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Convert screen coordinates to canvas coordinates
      const canvasCoords = CanvasCalculationService.screenToCanvas(
        rect.left,
        rect.top,
        canvasRef.current
      );
      
      // Constrain final position to canvas
      const constrainedBounds = CanvasCalculationService.constrainToCanvas(
        {
          x: canvasCoords.x,
          y: canvasCoords.y,
          width: rect.width,
          height: rect.height
        },
        { width: canvasRect.width, height: canvasRect.height }
      );

      updateElement({
        ...element,
        style: {
          ...element.style,
          x: constrainedBounds.x,
          y: constrainedBounds.y,
          width: constrainedBounds.width,
          height: constrainedBounds.height
        }
      });
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, handle: string) => {
    if (e.button !== 0 || isInGroup) return;
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeHandle(handle);

    if (elementRef.current && canvasRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();

      const x = rect.left - canvasRect.left;
      const y = rect.top - canvasRect.top;
      setInitialSize({
        x,
        y,
        width: rect.width,
        height: rect.height
      });

      setInitialMousePosition({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelected) {
      openStyleEditor(element);
    }
    
    if (element.animation?.click) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 300);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(element, e.clientX, e.clientY);
  };

  const handleMouseEnter = () => {
    if (element.animation?.hover) setIsHovered(true);
  };

  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    if ((isDragging || isResizing) && !isInGroup) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle]);

  const renderResizeHandles = () => {
    if (!isSelected || isInGroup) return null;
    
    const handles = [
      { position: 'n', cursor: 'ns-resize', top: '-5px', left: '50%' },
      { position: 's', cursor: 'ns-resize', bottom: '-5px', left: '50%' },
      { position: 'e', cursor: 'ew-resize', right: '-5px', top: '50%' },
      { position: 'w', cursor: 'ew-resize', left: '-5px', top: '50%' },
      { position: 'ne', cursor: 'nesw-resize', top: '-5px', right: '-5px' },
      { position: 'nw', cursor: 'nwse-resize', top: '-5px', left: '-5px' },
      { position: 'se', cursor: 'nwse-resize', bottom: '-5px', right: '-5px' },
      { position: 'sw', cursor: 'nesw-resize', bottom: '-5px', left: '-5px' }
    ];
    
    return handles.map(h => (
      <div
        key={h.position}
        className="resize-handle"
        style={{
          position: 'absolute',
          top: h.top,
          left: h.left,
          right: h.right,
          bottom: h.bottom,
          width: '10px',
          height: '10px',
          backgroundColor: '#3498db',
          borderRadius: '50%',
          cursor: h.cursor,
          zIndex: 1001,
          transform: h.left === '50%' ? 'translateX(-50%)' : h.top === '50%' ? 'translateY(-50%)' : undefined
        }}
        onMouseDown={(e) => handleResizeStart(e, h.position)}
      />
    ));
  };

  const renderContent = (): React.ReactNode => {
    switch (type) {
      case 'button':
        return <ButtonElement element={element} />;
      case 'image':
        return <ImageElement element={element} />;
      case 'paragraph':
        return <ParagraphElement element={element} />;
      case 'heading':
        return <HeadingElement element={element} />;
      case 'video':
        return <VideoElement element={element} />;
      case 'shape':
        return <ShapeElement element={element} />;
      default:
        return <div style={{pointerEvents: 'none'}}>Unknown element type: {type}</div>;
    }
  };

  // For link elements, wrap content in an anchor tag
  const wrapWithLink = (content: React.ReactNode): React.ReactNode => {
    if (href) {
      return (
        <a 
          href={"#"} 
          target={target || '_blank'} 
          rel="noopener noreferrer"
          style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'block',
            width: '100%',
            height: '100%',
            pointerEvents: 'auto'
          }}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
        >
          {content}
        </a>
      );
    }
    return content;
  };

  return (
    <div
      ref={elementRef}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-element-id={id}
      data-element-type={type}
      className={`element-wrapper ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isInGroup ? 'in-group' : ''} ${getAnimationClasses()}`}
    >
      {wrapWithLink(renderContent())}
      {renderResizeHandles()}
    </div>
  );
};

export default ElementRenderer;

