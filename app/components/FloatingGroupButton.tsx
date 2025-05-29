import React, { useEffect, useState } from 'react';
import { useDesigner } from '../contexts/DesignerContext';

const FloatingGroupButton: React.FC = () => {
  const { 
    selectedElementIds, 
    elements, 
    updateElements,
    selectElement,
    canvasRef 
  } = useDesigner();

  const [buttonPosition, setButtonPosition] = useState({ top: 20, left: 20 });

  // Check if we have a single group selected
  const selectedGroup = selectedElementIds.length === 1 ? 
    elements.find(el => el.id === selectedElementIds[0] && el.type === 'group') : null;

  // Show condition
  const shouldShow = selectedElementIds.length >= 2 || selectedGroup;

  const calculateGroupBounds = (elements: any[]) => {
    const positions = elements.map(el => ({
      x: el.style.x,
      y: el.style.y,
      width: typeof el.style.width === 'number' ? el.style.width : parseFloat(el.style.width),
      height: typeof el.style.height === 'number' ? el.style.height : parseFloat(el.style.height)
    }));

    const minX = Math.min(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxX = Math.max(...positions.map(p => p.x + p.width));
    const maxY = Math.max(...positions.map(p => p.y + p.height));

    return {
      x: minX - 10,
      y: minY - 10,
      width: maxX - minX + 20,
      height: maxY - minY + 20
    };
  };

  const calculateButtonPosition = () => {
    if (!canvasRef.current) return { top: 20, left: 20 };

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;
    
    // Button dimensions (approximate)
    const buttonWidth = 100; // Approximate width of the button
    const buttonHeight = 40; // Approximate height of the button
    const margin = 10; // Margin from canvas edges

    let targetX, targetY;

    if (selectedGroup) {
      // Position relative to the selected group
      targetX = selectedGroup.style.x + (selectedGroup.style.width as number) / 2;
      targetY = selectedGroup.style.y;
    } else {
      // Position relative to the selection bounds
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
      if (selectedElements.length === 0) return { top: 20, left: 20 };
      
      const bounds = calculateGroupBounds(selectedElements);
      targetX = bounds.x + bounds.width / 2;
      targetY = bounds.y;
    }

    // Calculate initial position (centered above the target)
    let left = targetX - buttonWidth / 2;
    let top = targetY - buttonHeight - 10; // 10px above the target

    // Adjust horizontal position to stay within canvas bounds
    if (left < margin) {
      left = margin;
    } else if (left + buttonWidth > canvasWidth - margin) {
      left = canvasWidth - buttonWidth - margin;
    }

    // Adjust vertical position to stay within canvas bounds
    if (top < margin) {
      // If button would be above canvas, position it below the target instead
      if (selectedGroup) {
        top = selectedGroup.style.y + (selectedGroup.style.height as number) + 10;
      } else {
        const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
        if (selectedElements.length > 0) {
          const bounds = calculateGroupBounds(selectedElements);
          top = bounds.y + bounds.height + 10;
        }
      }
      
      // If still outside canvas bounds, position at top with margin
      if (top < margin) {
        top = margin;
      }
    }

    // Final check to ensure button doesn't go below canvas
    if (top + buttonHeight > canvasHeight - margin) {
      top = canvasHeight - buttonHeight - margin;
    }

    return { top, left };
  };

  // Update button position when selection changes - MOVED BEFORE EARLY RETURN
  useEffect(() => {
    if (shouldShow) {
      const newPosition = calculateButtonPosition();
      setButtonPosition(newPosition);
    }
  }, [selectedElementIds, selectedGroup, elements, shouldShow]);

  // Early return AFTER all hooks
  if (!shouldShow) {
    return null;
  }

  const handleCreateGroup = () => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    
    if (selectedElements.length < 2) return;

    // Calculate group bounds
    const bounds = calculateGroupBounds(selectedElements);
    
    // Create new group element
    const groupId = `group-${Date.now()}`;
    const groupElement = {
      id: groupId,
      type: 'group' as const,
      style: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        zIndex: Math.max(...selectedElements.map(el => el.style.zIndex || 0)) + 1
      },
      content: {},
      parentId: undefined
    };

    // Update selected elements to be children of the group
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return {
          ...el,
          parentId: groupId,
          style: {
            ...el.style,
            x: el.style.x - bounds.x,
            y: el.style.y - bounds.y
          }
        };
      }
      return el;
    });

    // Add the group element
    const newElements = [...updatedElements, groupElement];
    
    updateElements(newElements);
    selectElement(groupElement, false);
  };

  const handleUngroup = () => {
    if (!selectedGroup) return;

    // Find all child elements
    const childElements = elements.filter(el => el.parentId === selectedGroup.id);
    
    // Update child elements to be top-level and adjust their positions
    const updatedElements = elements.map(el => {
      if (el.parentId === selectedGroup.id) {
        return {
          ...el,
          parentId: undefined,
          style: {
            ...el.style,
            x: el.style.x + selectedGroup.style.x,
            y: el.style.y + selectedGroup.style.y
          }
        };
      }
      return el;
    }).filter(el => el.id !== selectedGroup.id); // Remove the group element

    updateElements(updatedElements);
    
    // Select the ungrouped elements
    if (childElements.length > 0) {
      childElements.forEach((el, index) => {
        selectElement(el, index > 0);
      });
    }
  };

  return (
    <div className="floating-group-button">
      {selectedGroup ? (
        <button
          className="group-button ungroup-button"
          onClick={handleUngroup}
          title="Ungroup elements"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Ungroup</span>
        </button>
      ) : (
        <button
          className="group-button"
          onClick={handleCreateGroup}
          title={`Group ${selectedElementIds.length} elements`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M11 6H13M11 18H13M6 11V13M18 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Group</span>
        </button>
      )}

      <style jsx>{`
        .floating-group-button {
          position: absolute;
          top: ${buttonPosition.top}px;
          left: ${buttonPosition.left}px;
          z-index: 1000;
          pointer-events: none;
        }

        .group-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
          transition: all 0.2s ease;
          pointer-events: all;
          white-space: nowrap;
          min-width: 100px;
          justify-content: center;
        }

        .group-button:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
        }

        .group-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
        }

        .ungroup-button {
          background-color: #e74c3c;
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .ungroup-button:hover {
          background-color: #c0392b;
          box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
        }

        .group-button svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default FloatingGroupButton;
