import React from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import ElementRenderer from './ElementRenderer';
import { Element } from '../types/template';

interface GroupContainerProps {
  group: Element;
}

const GroupContainer: React.FC<GroupContainerProps> = ({ group }) => {
  const {
    elements,
    selectedElementIds,
    selectElement,
    updateElement,
    openContextMenu,
    openStyleEditor
  } = useDesigner();

  const isSelected = selectedElementIds.includes(group.id);
  
  // Find all child elements of this group
  const childElements = elements.filter(el => el.parentId === group.id);
  
  const handleGroupMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    selectElement(group, isMultiSelect);
  };

  return (
    <div
      data-element-id={group.id}
      data-element-type="group"
      style={{
        position: 'absolute',
        left: `${group.style.x}px`,
        top: `${group.style.y}px`,
        width: typeof group.style.width === 'string' ? group.style.width : `${group.style.width}px`,
        height: typeof group.style.height === 'string' ? group.style.height : `${group.style.height}px`,
        border: isSelected ? '1px dashed #3498db' : '1px dashed rgba(0,0,0,0.2)',
        backgroundColor: 'rgba(52, 152, 219, 0.05)',
        boxSizing: 'border-box',
        zIndex: group.style.zIndex,
        cursor: 'grab',
        pointerEvents: 'all'
      }}
      onMouseDown={handleGroupMouseDown}
    >
      {/* Render all child elements */}
      {childElements.map((element) => (
        <ElementRenderer 
          key={element.id} 
          element={element}
          isInGroup={true}
        />
      ))}
      
      {/* Group label */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '0',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '2px 6px',
            fontSize: '10px',
            borderRadius: '2px',
            pointerEvents: 'none'
          }}
        >
          Group
        </div>
      )}
    </div>
  );
};

export default GroupContainer;
