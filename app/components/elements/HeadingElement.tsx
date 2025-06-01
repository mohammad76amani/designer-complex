import React from 'react';
import { Element } from '../../types/template';

const HeadingElement = ({ element }: { element: Element }) => {
  const { content, style } = element;
  
  return (
    <h2 style={{
      margin: 0, 
      width: '100%', 
      pointerEvents: 'none',
      textAlign: style.textAlign as 'left' | 'center' | 'right',
      fontSize: style.fontSize || 24,
      fontWeight: style.fontWeight || 'bold',
      color: style.color || '#000000',
      letterSpacing: style.letterSpacing || 0,
      lineHeight: style.lineHeight || 1.2,
      padding: style.padding || 0,
    }}>
      {content}
    </h2>
  );
};

export default HeadingElement;
