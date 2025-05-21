import React, { useState, useRef, useEffect } from 'react';
import { ElementRendererProps } from '../types/template';
import ShapeElement from './elements/ShapeElement';
import ButtonElement from './elements/ButtonElement';
import HeadingElement from './elements/HeadingElement';
import ImageElement from './elements/ImageElement';
import ParagraphElement from './elements/ParagraphElement';
import VideoElement from './elements/VideoElement';

const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  onSelect,
  isSelected,
  onUpdateElement,
  canvasRef,
  onContextMenu,
  onOpenStyleEditor,
  isInGroup
}) => {
  const { id, type, content, style, src, alt, href, target } = element;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Generate dynamic styles
  const generateBoxShadow = () => {
    if (isHovered && element.animation?.hover === 'shadow') {
      return '0 5px 15px rgba(0,0,0,0.2)';
    }
    if (style.boxShadowBlur || style.boxShadowSpread) {
      const blur = style.boxShadowBlur || 0;
      const spread = style.boxShadowSpread || 0;
      const color = style.boxShadowColor || 'rgba(0,0,0,0.2)';
      return `0 0 ${blur}px ${spread}px ${color}`;
    }
    return isSelected ? '0 0 10px rgba(52, 152, 219, 0.5)' : 'none';
  };

  const generateTransform = () => {
    const transforms = [];
    if (style.rotate) transforms.push(`rotate(${style.rotate}deg)`);
    if (style.scale && style.scale !== 1) transforms.push(`scale(${style.scale})`);
    if (isHovered) {
      if (element.animation?.hover === 'scale-up') transforms.push('scale(1.05)');
      if (element.animation?.hover === 'scale-down') transforms.push('scale(0.95)');
    }
    if (isActive && element.animation?.click === 'scale-down') {
      transforms.push('scale(0.9)');
    }
    return transforms.length ? transforms.join(' ') : 'none';
  };

  const generateFilter = () => {
    const filters = [];
    if (style.blur) filters.push(`blur(${style.blur}px)`);
    if (style.brightness && style.brightness !== 100) filters.push(`brightness(${style.brightness}%)`);
    if (style.contrast && style.contrast !== 100) filters.push(`contrast(${style.contrast}%)`);
    return filters.join(' ') || 'none';
  };

  const generateBorder = () => {
    if (isHovered && element.animation?.hover === 'border') {
      return `2px solid ${element.animation.hoverBorderColor || '#3498db'}`;
    }
    if (style.borderWidth && style.borderStyle !== 'none') {
      return `${style.borderWidth}px ${style.borderStyle} ${style.borderColor || '#000000'}`;
    }
    return isSelected ? '2px solid #3498db' : 'none';
  };

  const getBackgroundColor = () => {
    if (isActive && element.animation?.click === 'bg-color') {
      return element.animation.clickBgColor || '#2980b9';
    }
    if (isHovered && element.animation?.hover === 'bg-color') {
      return element.animation.hoverBgColor || '#3498db';
    }
    return style.backgroundColor;
  };

  const getTextColor = () => {
    if (isActive && element.animation?.click === 'text-color') {
      return element.animation.clickTextColor || '#ffffff';
    }
    if (isHovered && element.animation?.hover === 'text-color') {
      return element.animation.hoverTextColor || '#ffffff';
    }
    return style.color;
  };

  // Generate animation classes
  const getAnimationClasses = () => {
    if (!element.animation) return '';
    
    const classes = [];
    
    if (element.animation.entrance && element.animation.entrance.type !== 'none') {
      classes.push(`entrance-${element.animation.entrance.type}`);
    }
    
    if (isActive) {
      if (element.animation.click === 'bounce') classes.push('animate-bounce');
      if (element.animation.click === 'pulse') classes.push('animate-pulse');
    }
    
    return classes.join(' ');
  };

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: typeof style.width === 'string' ? style.width : `${style.width}px`,
    height: typeof style.height === 'string' ? style.height : `${style.height}px`,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: getTextColor(),
    backgroundColor: type === 'shape' ? 'transparent' : getBackgroundColor(),
    borderRadius: `${style.borderRadius}px`,
    padding: `${style.padding}px`,
    textAlign: style.textAlign as 'left' | 'center' | 'right',
    zIndex: isDragging || isResizing ? 1000 : style.zIndex,
    boxSizing: 'border-box',
    cursor: isDragging ? 'grabbing' : (isInGroup ? 'pointer' : 'grab'),
    border: type === 'shape' ? 'none' : generateBorder(),
    boxShadow: type === 'shape' ? 'none' : generateBoxShadow(),
    userSelect: 'none',
    touchAction: 'none',
    opacity: style.opacity ?? 1,
    letterSpacing: style.letterSpacing !== undefined ? `${style.letterSpacing}px` : 'normal',
    lineHeight: style.lineHeight ?? 'normal',
    transform: generateTransform(),
    filter: type === 'shape' ? 'none' : generateFilter(),
    transition: 'all 0.2s ease',
    animationDuration: element.animation?.entrance?.duration ? `${element.animation.entrance.duration}ms` : '1000ms',
    animationDelay: element.animation?.entrance?.delay ? `${element.animation.entrance.delay}ms` : '0ms',
    animationFillMode: 'both'
  };

  // Event handlers for drag, resize, click, hover...
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only respond to left mouse button (button 0)
    if (e.button !== 0) return;
    
    // Prevent dragging if in a group
    if (isInGroup) {
      e.stopPropagation();
      
      // Select the element, passing the multi-select flag if shift/ctrl is pressed
      const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
      onSelect(isMultiSelect);
      
      if (element.animation?.click) {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 300);
      }
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select the element, passing the multi-select flag if shift/ctrl is pressed
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    onSelect(isMultiSelect);
    
    setIsDragging(true);
    
    // Calculate the offset from the mouse position to the element's top-left corner
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    if (element.animation?.click) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 300);
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current || isInGroup) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    if (isDragging) {
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

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

      switch (resizeHandle) {
        case 'e':
          newWidth = Math.max(20, initialSize.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(20, initialSize.width - deltaX);
          newX = initialPosition.x + deltaX;
          break;
        case 's':
          newHeight = Math.max(20, initialSize.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(20, initialSize.height - deltaY);
          newY = initialPosition.y + deltaY;
          break;
        case 'se':
          newWidth = Math.max(20, initialSize.width + deltaX);
          newHeight = Math.max(20, initialSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(20, initialSize.width - deltaX);
          newHeight = Math.max(20, initialSize.height + deltaY);
          newX = initialPosition.x + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(20, initialSize.width + deltaX);
          newHeight = Math.max(20, initialSize.height - deltaY);
          newY = initialPosition.y + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(20, initialSize.width - deltaX);
          newHeight = Math.max(20, initialSize.height - deltaY);
          newX = initialPosition.x + deltaX;
          newY = initialPosition.y + deltaY;
          break;
      }

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
    if ((!isDragging && !isResizing) || isInGroup) return;

    if (elementRef.current && canvasRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();

      const finalX = rect.left - canvasRect.left;
      const finalY = rect.top - canvasRect.top;

      onUpdateElement({
        ...element,
        style: {
          ...element.style,
          x: Math.max(0, finalX),
          y: Math.max(0, finalY),
          width: rect.width,
          height: rect.height
        }
      });
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    if (e.button !== 0 || isInGroup) return;
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
    if (isSelected && onOpenStyleEditor) {
      onOpenStyleEditor();
    }
    
    if (element.animation?.click) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 300);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(element, e.clientX, e.clientY);
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
          ...h,
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: '#3498db',
          borderRadius: '50%',
          cursor: h.cursor,
          zIndex: 1001
        }}
        onMouseDown={(e) => handleResizeStart(e, h.position)}
      />
    ));
  };
const renderContent = () => {
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
  const wrapWithLink = (content: React.ReactNode) => {
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
          onClick={(e) => e.stopPropagation()}
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
