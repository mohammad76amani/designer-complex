import React from 'react';
import { Element } from '../../types/template';

interface GenericElementProps {
  element: Element;
}

const GenericElement: React.FC<GenericElementProps> = ({ element }) => {
  const { type, content } = element;
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      {content || `Unknown element type: ${type}`}
    </div>
  );
};

export default GenericElement;