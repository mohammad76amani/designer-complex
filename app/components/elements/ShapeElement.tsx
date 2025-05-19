import React from 'react';
import { Element } from '../../types/template';

interface ShapeElementProps {
  element: Element;
}

const ShapeElement: React.FC<ShapeElementProps> = ({ element }) => {
  const { shapeType = 'rectangle', style } = element;
  
  console.log(`Rendering ShapeElement with shapeType: ${shapeType}, backgroundColor: ${style.backgroundColor}`);
  
  // Container style - no background color
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    pointerEvents: 'none'
  };
  
  // Rectangle shape
  if (shapeType === 'rectangle' || !shapeType) {
    return (
      <div style={containerStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: style.color,
          borderRadius: `${style.borderRadius || 0}px`
        }} />
      </div>
    );
  }
  
  // Circle shape
  if (shapeType === 'circle') {
    return (
      <div style={containerStyle}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: style.color,
          borderRadius: '50%'
        }} />
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
            fill={style.color} 
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
            fill={style.color} 
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
            fill={style.color} 
          />
        </svg>
      </div>
    );
  }
  
  // Default to rectangle
  console.warn(`Unknown shape type: ${shapeType}, defaulting to rectangle`);
  return (
    <div style={containerStyle}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: `${style.borderRadius || 0}px`
      }} />
    </div>
  );
};

export default ShapeElement;
