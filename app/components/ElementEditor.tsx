import React, { useState } from 'react';
import { Element } from '../types/template';

const ElementEditor= ({ element, onUpdateElement }: { element: Element, onUpdateElement: (element: Element) => void }) => {
  const [x, setX] = useState(element.style.x);
  const [y, setY] = useState(element.style.y);
  const [width, setWidth] = useState(element.style.width);
  const [height, setHeight] = useState(element.style.height);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedElement: Element = {
      ...element,
      style: {
        ...element.style,
        x,
        y,
        width: typeof width === 'string' ? width : Number(width),
        height: typeof height === 'string' ? height : Number(height),
      }
    };
    
    onUpdateElement(updatedElement);
  };
  
  return (
    <div className="element-editor">
      <h3>Edit {element.type}</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            X Position:
            <input 
              type="number" 
              value={x} 
              onChange={(e) => setX(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Y Position:
            <input 
              type="number" 
              value={y} 
              onChange={(e) => setY(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Width:
            <input 
              type="number" 
              value={typeof width === 'string' ? width.replace('px', '') : width} 
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Height:
            <input 
              type="number" 
              value={typeof height === 'string' ? height.replace('px', '') : height} 
              onChange={(e) => setHeight(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </label>
        </div>
        
        <button 
          type="submit"
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Update Element
        </button>
      </form>
    </div>
  );
};

export default ElementEditor;