import React from 'react';
import { Element } from '../../types/template';

interface ShapeElementProps {
  element: Element;
}

const ShapeElement: React.FC<ShapeElementProps> = ({ element }) => {
  const { shapeType = 'rectangle', style, id } = element;
  const { 
    backgroundColor, 
    borderWidth = 0, 
    borderStyle = 'none', 
    borderColor = '#000', 
    borderRadius = 0,
    boxShadowBlur = 0,
    boxShadowSpread = 0,
    boxShadowColor = 'rgba(0,0,0,0.2)'
  } = style;
  
  // Generate unique filter ID for this element
  const filterId = `shadow-${id}`;
  
  // Generate box shadow CSS for div-based shapes
  const boxShadow = boxShadowBlur || boxShadowSpread 
    ? `0 0 ${boxShadowBlur}px ${boxShadowSpread}px ${boxShadowColor}`
    : 'none';
  
  // For SVG shapes, we need to use a filter
  const useSvgShape = ['triangle', 'arrow', 'star', 'hexagon', 'line', 'heart', 'cloud'].includes(shapeType);
  
  // Common style for container div
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'visible'
  };
  
  if (useSvgShape) {
    // For SVG shapes, render with filter
    return (
      <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Define the shadow filter */}
          <defs>
            <filter 
              id={filterId} 
              x="-50%" 
              y="-50%" 
              width="200%" 
              height="200%"
            >
              <feGaussianBlur 
                in="SourceAlpha" 
                stdDeviation={boxShadowBlur / 2} 
                result="blur"
              />
              <feOffset 
                dx="0" 
                dy="0" 
                result="offsetBlur"
              />
              <feFlood 
                floodColor={boxShadowColor} 
                result="color"
              />
              <feComposite 
                in="color" 
                in2="offsetBlur" 
                operator="in" 
                result="shadow"
              />
              <feComposite 
                in="SourceGraphic" 
                in2="shadow" 
                operator="over"
              />
            </filter>
          </defs>
          
          {/* Render the appropriate shape with the filter */}
          {shapeType === 'triangle' && (
            <polygon 
              points="50,10 90,90 10,90" 
              fill={backgroundColor} 
              stroke={borderWidth ? borderColor : 'none'} 
              strokeWidth={borderWidth}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
          
          {shapeType === 'arrow' && (
            <path 
              d="M 20,40 L 60,40 L 60,20 L 80,50 L 60,80 L 60,60 L 20,60 Z" 
              fill={backgroundColor} 
              stroke={borderWidth ? borderColor : 'none'} 
              strokeWidth={borderWidth}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
          
          {shapeType === 'star' && (
            <path 
              d="M 50,10 L 61,35 L 90,35 L 65,55 L 75,80 L 50,65 L 25,80 L 35,55 L 10,35 L 39,35 Z" 
              fill={backgroundColor} 
              stroke={borderWidth ? borderColor : 'none'} 
              strokeWidth={borderWidth}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
          
          {shapeType === 'hexagon' && (
            <path 
              d="M 25,10 L 75,10 L 95,50 L 75,90 L 25,90 L 5,50 Z" 
              fill={backgroundColor} 
              stroke={borderWidth ? borderColor : 'none'} 
              strokeWidth={borderWidth}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
          
          {shapeType === 'line' && (
            <line 
              x1="10" 
              y1="50" 
              x2="90" 
              y2="50" 
              stroke={borderColor || backgroundColor || '#000'} 
              strokeWidth={borderWidth || 2} 
              strokeDasharray={borderStyle === 'dashed' ? '5,5' : borderStyle === 'dotted' ? '2,2' : 'none'}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
          
          {shapeType === 'heart' && (
            <path 
              d="M 50,80 C 35,65 10,50 10,30 C 10,15 25,10 40,20 L 50,30 L 60,20 C 75,10 90,15 90,30 C 90,50 65,65 50,80 Z" 
              fill={backgroundColor} 
              stroke={borderWidth ? borderColor : 'none'} 
              strokeWidth={borderWidth}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
          
          {shapeType === 'cloud' && (
            <path 
              d="M 20,60 C 10,60 10,50 15,45 C 15,35 25,30 35,35 C 40,20 60,20 70,35 C 80,30 90,40 85,50 C 90,55 90,65 80,65 C 80,70 75,75 65,75 L 35,75 C 25,75 20,70 20,60 Z" 
              fill={backgroundColor} 
              stroke={borderWidth ? borderColor : 'none'} 
              strokeWidth={borderWidth}
              filter={boxShadowBlur > 0 ? `url(#${filterId})` : undefined}
            />
          )}
        </svg>
      </div>
    );
  } else {
    // For rectangle and circle, use CSS box-shadow
    if (shapeType === 'rectangle') {
      return (
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor,
              borderRadius: `${borderRadius}px`,
              border: borderWidth && borderStyle !== 'none' 
                ? `${borderWidth}px ${borderStyle} ${borderColor}` 
                : 'none',
              boxShadow
            }}
          />
        </div>
      );
    } else if (shapeType === 'circle') {
      return (
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor,
              borderRadius: '50%',
              border: borderWidth && borderStyle !== 'none' 
                ? `${borderWidth}px ${borderStyle} ${borderColor}` 
                : 'none',
              boxShadow
            }}
          />
        </div>
      );
    }
  }
  
  // Default fallback
  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor,
          borderRadius: `${borderRadius}px`,
          border: borderWidth && borderStyle !== 'none' 
            ? `${borderWidth}px ${borderStyle} ${borderColor}` 
            : 'none',
          boxShadow
        }}
      />
    </div>
  );
};

export default ShapeElement;
