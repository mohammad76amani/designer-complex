import React, { useEffect, useRef } from 'react';
import { ContextMenuProps } from '../types/template';

const ContextMenu: React.FC<ContextMenuProps> = ({ 
  x, 
  y, 
  onClose, 
  onDelete, 
  onCopy, 
  onCut,
  onPaste,
  canPaste
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Adjust position to ensure menu stays within viewport
  const adjustedX = Math.min(x, window.innerWidth - 150);
  const adjustedY = Math.min(y, window.innerHeight - 150);
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${adjustedY}px`,
    left: `${adjustedX}px`,
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    borderRadius: '4px',
    padding: '5px 0',
    zIndex: 1000,
    minWidth: '150px',
  };
  
  const menuItemStyle: React.CSSProperties = {
    padding: '8px 15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  };
  
  const menuItemHoverStyle = {
    backgroundColor: '#f5f5f5',
  };
  
  const disabledItemStyle: React.CSSProperties = {
    ...menuItemStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };
  
  return (
    <div ref={menuRef} style={menuStyle} className="context-menu">
      <div 
        style={menuItemStyle} 
        className="context-menu-item"
        onClick={onCopy}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, menuItemHoverStyle)}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
      >
        <span style={{ fontSize: '16px' }}>📋</span> Copy
      </div>
      <div 
        style={menuItemStyle} 
        className="context-menu-item"
        onClick={onCut}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, menuItemHoverStyle)}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
      >
        <span style={{ fontSize: '16px' }}>✂️</span> Cut
      </div>
      {onPaste && (
        <div 
          style={canPaste ? menuItemStyle : disabledItemStyle} 
          className="context-menu-item"
          onClick={canPaste ? onPaste : undefined}
          onMouseEnter={(e) => canPaste && Object.assign(e.currentTarget.style, menuItemHoverStyle)}
          onMouseLeave={(e) => canPaste && (e.currentTarget.style.backgroundColor = '')}
        >
          <span style={{ fontSize: '16px' }}>📌</span> Paste
        </div>
      )}
      <div style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '5px 0' }} />
      <div 
        style={{...menuItemStyle, color: '#e53935'}} 
        className="context-menu-item"
        onClick={onDelete}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, {...menuItemHoverStyle, color: '#e53935'})}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '';
          e.currentTarget.style.color = '#e53935';
        }}
      >
        <span style={{ fontSize: '16px' }}>🗑️</span> Delete
      </div>
    </div>
  );
};

export default ContextMenu;
