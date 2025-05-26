import React from 'react';
import { Element } from '../../types/template';


const ParagraphElement= ({ element }:{element: Element}) => {
  const { content, style } = element;
  
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
};

export default ParagraphElement;