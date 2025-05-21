import React from 'react';
import { Element } from '../../types/template';

interface ParagraphElementProps {
  element: Element;
}

const ParagraphElement: React.FC<ParagraphElementProps> = ({ element }) => {
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