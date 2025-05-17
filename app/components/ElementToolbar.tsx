import React, { useState } from 'react';
import { Element } from '../types/template';

interface ElementToolbarProps {
  onAddElement: (elementType: string) => void;
}

const ElementToolbar: React.FC<ElementToolbarProps> = ({ onAddElement }) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const elementTypes = [
    { 
      type: 'heading', 
      label: 'Heading', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4V20M18 4V20M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      type: 'paragraph', 
      label: 'Text', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7H20M4 12H16M4 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      type: 'button', 
      label: 'Button', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      type: 'image', 
      label: 'Image', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      type: 'video', 
      label: 'Video', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 9L15 12L10 15V9Z" fill="currentColor"/>
        </svg>
      )
    },
    { 
      type: 'shape', 
      label: 'Shape', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6H21V18H3V6Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6L21 18H3L12 6Z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="element-toolbar">
      {elementTypes.map((element) => (
        <div key={element.type} className="element-button-container">
          <button
            className="element-button"
            onClick={() => onAddElement(element.type)}
            onMouseEnter={() => setHoveredElement(element.type)}
            onMouseLeave={() => setHoveredElement(null)}
            title={element.label}
          >
            {element.icon}
          </button>
          
          {hoveredElement === element.type && (
            <div className="element-tooltip">
              {element.label}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        .element-toolbar {
          display: flex;
          flex-direction: row;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          padding: 4px 8px;
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }

        .element-button-container {
          position: relative;
          margin: 0 2px;
        }

        .element-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: #555;
        }

        .element-button:hover {
          background-color: #f5f5f5;
          color: #000;
        }

        .element-button:active {
          background-color: #e9ecef;
          transform: scale(0.97);
        }

        .element-tooltip {
          position: absolute;
          left: 50%;
          bottom: -28px;
          transform: translateX(-50%);
          background-color: #333;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 101;
        }

        .element-tooltip:before {
          content: '';
          position: absolute;
          left: 50%;
          top: -4px;
          transform: translateX(-50%);
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 4px solid #333;
        }
      `}</style>
    </div>
  );
};

export default ElementToolbar;
