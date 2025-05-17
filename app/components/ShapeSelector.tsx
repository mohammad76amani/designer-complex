import React from 'react';

interface ShapeSelectorProps {
  onSelectShape: (shapeType: string) => void;
  onClose: () => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ onSelectShape, onClose }) => {
  const shapes = [
    { type: 'rectangle', label: 'Rectangle' },
    { type: 'circle', label: 'Circle' },
    { type: 'triangle', label: 'Triangle' },
    { type: 'arrow', label: 'Arrow' },
    { type: 'star', label: 'Star' },
    { type: 'hexagon', label: 'Hexagon' },
    { type: 'line', label: 'Line' },
    { type: 'heart', label: 'Heart' },
    { type: 'cloud', label: 'Cloud' }
  ];
  
  // Handle click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.shape-selector')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div className="shape-selector">
      <div className="shape-selector-header">
        <h4>Select Shape</h4>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="shape-grid">
        {shapes.map(shape => (
          <div 
            key={shape.type} 
            className="shape-item"
            onClick={() => onSelectShape(shape.type)}
          >
            <div className="shape-preview">
              {renderShapePreview(shape.type)}
            </div>
            <div className="shape-label">{shape.label}</div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .shape-selector {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          overflow: hidden;
        }
        
        .shape-selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .shape-selector-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #343a40;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          color: #6c757d;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .close-button:hover {
          background-color: #e9ecef;
          color: #343a40;
        }
        
        .shape-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
        }
        
        .shape-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .shape-item:hover {
          transform: scale(1.05);
        }
        
        .shape-preview {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
          border-radius: 4px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        
        .shape-label {
          font-size: 12px;
          color: #495057;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

// Helper function to render shape previews
const renderShapePreview = (shapeType: string) => {
  const style = {
    width: '40px',
    height: '40px',
    backgroundColor: '#0d6efd',
    position: 'relative' as 'relative'
  };
  
  switch (shapeType) {
    case 'rectangle':
      return <div style={{ ...style, borderRadius: '4px' }} />;
      
    case 'circle':
      return <div style={{ ...style, borderRadius: '50%' }} />;
      
    case 'triangle':
      return (
        <div style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              width: '0',
              height: '0',
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderBottom: '40px solid #0d6efd',
              position: 'absolute',
              top: '0',
              left: '0'
            }}
          />
        </div>
      );
      
    case 'arrow':
      return (
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path d="M 20,40 L 60,40 L 60,20 L 80,50 L 60,80 L 60,60 L 20,60 Z" fill="#0d6efd" />
        </svg>
      );
      
    case 'star':
      return (
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path d="M 50,10 L 61,35 L 90,35 L 65,55 L 75,80 L 50,65 L 25,80 L 35,55 L 10,35 L 39,35 Z" fill="#0d6efd" />
        </svg>
      );
      
    case 'hexagon':
      return (
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path d="M 25,10 L 75,10 L 95,50 L 75,90 L 25,90 L 5,50 Z" fill="#0d6efd" />
        </svg>
      );
      
    case 'line':
      return (
        <svg width="40" height="40" viewBox="0 0 100 100">
          <line x1="10" y1="50" x2="90" y2="50" stroke="#0d6efd" strokeWidth="6" />
        </svg>
      );
      
    case 'heart':
      return (
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path d="M 50,80 C 35,65 10,50 10,30 C 10,15 25,10 40,20 L 50,30 L 60,20 C 75,10 90,15 90,30 C 90,50 65,65 50,80 Z" fill="#0d6efd" />
        </svg>
      );
      
    case 'cloud':
      return (
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path d="M 20,60 C 10,60 10,50 15,45 C 15,35 25,30 35,35 C 40,20 60,20 70,35 C 80,30 90,40 85,50 C 90,55 90,65 80,65 C 80,70 75,75 65,75 L 35,75 C 25,75 20,70 20,60 Z" fill="#0d6efd" />
        </svg>
      );
      
    default:
      return <div style={{ ...style, borderRadius: '4px' }} />;
  }
};

export default ShapeSelector;
