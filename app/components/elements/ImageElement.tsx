import React from 'react';
import { Element } from '../../types/template';


const ImageElement = ({ element }:{element: Element;}) => {
  const { src, alt, style } = element;
  
  return (
    <img 
      src={src||''}
      width={1000} 
      height={1000}
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