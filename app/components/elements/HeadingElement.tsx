import React from 'react';
import { Element } from '../../types/template';


const HeadingElement = ({ element }:{element: Element;}) => {
  const { content, style } = element;
  
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
};

export default HeadingElement;