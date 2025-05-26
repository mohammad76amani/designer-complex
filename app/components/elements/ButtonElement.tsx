import React from 'react';
import { Element } from '../../types/template';



const ButtonElement = ({ element }: { element: Element }) => {
  const { content, style } = element;
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: style.textAlign === 'center' ? 'center' : 
                     style.textAlign === 'right' ? 'flex-end' : 'flex-start',
      pointerEvents: 'none'
    }}>
      {content}
    </div>
  );
};

export default ButtonElement;