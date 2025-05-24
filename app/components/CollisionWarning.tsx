import React from 'react';

interface CollisionWarningProps {
  collidingElements: string[];
  position: { x: number; y: number };
}

const CollisionWarning: React.FC<CollisionWarningProps> = ({ 
  collidingElements, 
  position 
}) => {
  if (collidingElements.length === 0) return null;
  
  return (
    <div
      className="collision-warning"
      style={{
        position: 'absolute',
        left: `${position.x + 10}px`,
        top: `${position.y - 30}px`,
        background: '#ff6b6b',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        zIndex: 1001,
        pointerEvents: 'none'
      }}
    >
      ⚠️ Overlapping with {collidingElements.length} element{collidingElements.length > 1 ? 's' : ''}
    </div>
  );
};

export default CollisionWarning;