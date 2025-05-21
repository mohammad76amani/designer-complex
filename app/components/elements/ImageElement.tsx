import React from 'react';
import { Element } from '../../types/template';

interface ImageElementProps {
  element: Element;
}

const ImageElement: React.FC<ImageElementProps> = ({ element }) => {
  const { src, alt, style } = element;
  
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
};

export default ImageElement;