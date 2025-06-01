import React from 'react';
import { Element } from '../../types/template';

const ParagraphElement = ({ element }: { element: Element }) => {
  const { content, style } = element;
  
  return (
    <p style={{
      margin: 0, 
      width: '100%', 
      pointerEvents: 'none',
      textAlign: style.textAlign as 'left' | 'center' | 'right',
      fontSize: style.fontSize || 16,
      fontWeight: style.fontWeight || 'normal',
      color: style.color || '#000000',
      letterSpacing: style.letterSpacing || 0,
      lineHeight: style.lineHeight || 1.5,
      padding: style.padding || 0,
    }}>
      {content}
    </p>
  );
};

export default ParagraphElement;
