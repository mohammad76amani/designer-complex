import React from 'react';
import { Element } from '../../types/template';

const ShapeElement = ({ element }: { element: Element }) => {
  const { shapeType = 'rectangle', style, svgStyle } = element;
  
  console.log(`Rendering ShapeElement with shapeType: ${shapeType}`, { style, svgStyle });
  
  // Get SVG properties with fallbacks
  const fill = svgStyle?.fill || style.color || '#3498db';
  const stroke = svgStyle?.stroke || 'transparent';
  const strokeWidth = svgStyle?.strokeWidth || 0;
  const opacity = svgStyle?.opacity || style.opacity || 1;
  
  // Container style - no background color, but apply shadow if needed
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    pointerEvents: 'none',
    // Apply shadow to container since SVG filters are complex
    ...(style.boxShadowBlur && {
      filter: `drop-shadow(${style.boxShadowOffsetX || 0}px ${style.boxShadowOffsetY || 0}px ${style.boxShadowBlur}px ${style.boxShadowColor || 'rgba(0,0,0,0.2)'})`
    })
  };
  
  // Rectangle shape
  if (shapeType === 'rectangle' || !shapeType) {
    return (
      <div style={containerStyle}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect 
            x="0" 
            y="0" 
            width="100" 
            height="100"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
            rx={style.borderRadius ? (style.borderRadius / Math.min(style.width as number, style.height as number)) * 100 : 0}
          />
        </svg>
      </div>
    );
  }
  
  // Circle shape
  if (shapeType === 'circle') {
    return (
      <div style={containerStyle}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <ellipse 
            cx="50" 
            cy="50" 
            rx="50" 
            ry="50"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </svg>
      </div>
    );
  }
  
  // Triangle shape
  if (shapeType === 'triangle') {
    return (
      <div style={containerStyle}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <polygon 
            points="50,10 90,90 10,90" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </svg>
      </div>
    );
  }
  
  // Arrow shape
  if (shapeType === 'arrow') {
    return (
      <div style={containerStyle}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M 20,40 L 60,40 L 60,20 L 80,50 L 60,80 L 60,60 L 20,60 Z" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </svg>
      </div>
    );
  }
  
  // Star shape
  if (shapeType === 'star') {
    return (
      <div style={containerStyle}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M 50,10 L 61,35 L 90,35 L 65,55 L 75,80 L 50,65 L 25,80 L 35,55 L 10,35 L 39,35 Z" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        </svg>
      </div>
    );
  }
  
  // Default to rectangle
  console.warn(`Unknown shape type: ${shapeType}, defaulting to rectangle`);
  return (
    <div style={containerStyle}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect 
          x="0" 
          y="0" 
          width="100" 
          height="100"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      </svg>
    </div>
  );
};

export default ShapeElement;
