import React, { useState, useRef, useEffect } from 'react';
import { ElementRendererProps } from '../types/template';
import ShapeElement from './elements/ShapeElement';

const ElementRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  onSelect,
  isSelected,
  onUpdateElement,
  canvasRef,
  onContextMenu,
  onOpenStyleEditor
}) => {
  const { id, type, content, style, src, alt, href, target } = element;
  const elementRef = useRef<HTMLDivElement>(null);
  
  // State for dragging and resizing
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  
  // Generate box shadow if shadow properties exist
  const generateBoxShadow = () => {
    if (style.boxShadowBlur || style.boxShadowSpread) {
      const blur = style.boxShadowBlur || 0;
      const spread = style.boxShadowSpread || 0;
      const color = style.boxShadowColor || 'rgba(0,0,0,0.2)';
      return `0 0 ${blur}px ${spread}px ${color}`;
    }
    return isSelected ? '0 0 10px rgba(52, 152, 219, 0.5)' : 'none';
  };
  
  // Generate transform style if transform properties exist
  const generateTransform = () => {
    const transforms = [];
    
    if (style.rotate) {
      transforms.push(`rotate(${style.rotate}deg)`);
    }
    
    if (style.scale && style.scale !== 1) {
      transforms.push(`scale(${style.scale})`);
    }
    
    return transforms.length ? transforms.join(' ') : 'none';
  };
  
  // Generate filter style if filter properties exist
  const generateFilter = () => {
    const filters = [];
    
    if (style.blur) {
      filters.push(`blur(${style.blur}px)`);
    }
    
    if (style.brightness && style.brightness !== 100) {
      filters.push(`brightness(${style.brightness}%)`);
    }
    
    if (style.contrast && style.contrast !== 100) {
      filters.push(`contrast(${style.contrast}%)`);
    }
    
    return filters.length ? filters.join(' ') : 'none';
  };
  
  // Generate border style if border properties exist
  const generateBorder = () => {
    if (style.borderWidth && style.borderStyle && style.borderStyle !== 'none') {
      return `${style.borderWidth}px ${style.borderStyle} ${style.borderColor || '#000000'}`;
    }
    return isSelected ? '2px solid #3498db' : 'none';
  };
  
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: typeof style.width === 'string' ? style.width : `${style.width}px`,
    height: typeof style.height === 'string' ? style.height : `${style.height}px`,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: style.color,
    // Only apply backgroundColor if not a shape
    backgroundColor: type === 'shape' ? 'transparent' : style.backgroundColor,
    borderRadius: `${style.borderRadius}px`,
    padding: `${style.padding}px`,
    textAlign: style.textAlign as 'left' | 'center' | 'right',
    zIndex: isDragging || isResizing ? 1000 : style.zIndex,
    boxSizing: 'border-box',
    cursor: isDragging ? 'grabbing' : 'grab',
    // Only apply border if not a shape
    border: type === 'shape' ? 'none' : generateBorder(),
    // Only apply box shadow if not a shape (shapes handle their own shadows)
    boxShadow: type === 'shape' ? 'none' : generateBoxShadow(),
    userSelect: 'none',
    touchAction: 'none',
    // Add new style properties
    opacity: style.opacity !== undefined ? style.opacity : 1,
    letterSpacing: style.letterSpacing !== undefined ? `${style.letterSpacing}px` : 'normal',
    lineHeight: style.lineHeight !== undefined ? style.lineHeight : 'normal',
    transform: generateTransform(),
    filter: type === 'shape' ? 'none' : generateFilter(), // Shapes handle their own filters
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only respond to left mouse button (button 0)
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select the element
    onSelect();
    
    // Start dragging
    setIsDragging(true);
    
    // Calculate the offset from the mouse position to the element's top-left corner
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    // Get canvas position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    if (isDragging) {
      // Calculate new position relative to the canvas
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      // Update element position in real-time
      if (elementRef.current) {
        elementRef.current.style.left = `${newX}px`;
        elementRef.current.style.top = `${newY}px`;
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
          newWidth = Math.max(20, initialSize.width + deltaX);
          break;
        case 'w': // West (left)
          newWidth = Math.max(20, initialSize.width - deltaX);
          newX = initialPosition.x + deltaX;
          break;
        case 's': // South (bottom)
          newHeight = Math.max(20, initialSize.height + deltaY);
          break;
        case 'n': // North (top)
          newHeight = Math.max(20, initialSize.height - deltaY);
          newY = initialPosition.y + deltaY;
          break;
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(20, initialSize.width + deltaX);
          newHeight = Math.max(20, initialSize.height + deltaY);
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(20, initialSize.width - deltaX);
          newHeight = Math.max(20, initialSize.height + deltaY);
          newX = initialPosition.x + deltaX;
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(20, initialSize.width + deltaX);
          newHeight = Math.max(20, initialSize.height - deltaY);
          newY = initialPosition.y + deltaY;
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(20, initialSize.width - deltaX);
          newHeight = Math.max(20, initialSize.height - deltaY);
          newX = initialPosition.x + deltaX;
          newY = initialPosition.y + deltaY;
          break;
      }
      
      // Update element size and position in real-time
      if (elementRef.current) {
        elementRef.current.style.width = `${newWidth}px`;
        elementRef.current.style.height = `${newHeight}px`;
        elementRef.current.style.left = `${newX}px`;
        elementRef.current.style.top = `${newY}px`;
      }
    }
  };
  
  // Handle mouse up to end dragging or resizing
  const handleMouseUp = () => {
    if (!isDragging && !isResizing) return;
    
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (canvasRect) {
        const finalX = rect.left - canvasRect.left;
        const finalY = rect.top - canvasRect.top;
        const finalWidth = rect.width;
        const finalHeight = rect.height;
        
        // Update the element with the new position and size
        onUpdateElement({
          ...element,
          style: {
            ...element.style,
            x: Math.max(0, finalX),
            y: Math.max(0, finalY),
            width: finalWidth,
            height: finalHeight
          }
        });
      }
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
    
    if (elementRef.current && canvasRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
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
  
  const handleClick = (e: React.MouseEvent) => {
    // We don't want to prevent default or stop propagation here
    // because we still want the element to be selected
    
    // If the element is already selected and we have an onOpenStyleEditor handler,
    // call it to open the style editor
    if (isSelected && onOpenStyleEditor) {
      onOpenStyleEditor();
    }
  };
  
  // Handle context menu (right-click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't select the element on right-click
    // Just show the context menu for this element
    onContextMenu(element, e.clientX, e.clientY);
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
  
  // Render different element types
const renderContent = () => {
  switch (type) {
    case 'button':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: style.textAlign === 'center' ? 'center' : 
                         style.textAlign === 'right' ? 'flex-end' : 'flex-start',
          pointerEvents: 'none'
        }}>
          {content}
        </div>
      );
      
    case 'image':
      return (
        <img 
          src={src} 
          alt={alt || 'Image'} 
          style={{
            width: '100%', 
            height: '100%', 
            objectFit: style.objectFit as 'cover' | 'contain' | 'fill' | 'none' || 'cover',
            borderRadius: `${style.borderRadius}px`,
            pointerEvents: 'none',
          }} 
        />
      );
      
    case 'paragraph':
      return (
        <p style={{
          margin: 0, 
          width: '100%', 
          pointerEvents: 'none',
          textAlign: style.textAlign as 'left' | 'center' | 'right',
        }}>
          {content}
        </p>
      );
      
    case 'heading':
      return (
        <h2 style={{
          margin: 0, 
          width: '100%', 
          pointerEvents: 'none',
          textAlign: style.textAlign as 'left' | 'center' | 'right',
        }}>
          {content}
        </h2>
      );
      
    case 'shape':
      return <ShapeElement element={element} />;
      
    case 'video':
      return (
        <video 
          src={element.videoSrc} 
          controls={element.controls}
          autoPlay={element.autoplay}
          loop={element.loop}
          muted={element.muted}
          style={{
            width: '100%', 
            height: '100%', 
            objectFit: style.objectFit as 'cover' | 'contain' | 'fill' | 'none' || 'cover',
            borderRadius: `${style.borderRadius}px`,
            pointerEvents: 'none',
          }} 
        />
      );
      
    default:
      return <div style={{pointerEvents: 'none'}}>Unknown element type: {type}</div>;
  }
};
  
  return (
    <div 
      ref={elementRef}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-element-id={id}
      data-element-type={type}
      className={`element-wrapper ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
    >
      {renderContent()}
      {renderResizeHandles()}
    </div>
  );
};

export default ElementRenderer;

