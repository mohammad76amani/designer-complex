import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  canPaste: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  onGroup,
  onUngroup,
  canPaste
}) => {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      <div className="context-menu">
        <div className="context-menu-item" onClick={onCopy}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Copy
        </div>
        
        <div className="context-menu-item" onClick={onCut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
            <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M14.5 9.5L9.5 14.5M21 3L9 15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Cut
        </div>
        
        <div 
          className={`context-menu-item ${!canPaste ? 'disabled' : ''}`} 
          onClick={canPaste ? onPaste : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Paste
        </div>
        
        
   
        <div className="context-menu-separator" />
        
        <div className="context-menu-item delete" onClick={onDelete}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Delete
        </div>

        <style jsx>{`
          .context-menu {
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            padding: 4px;
            min-width: 160px;
            z-index: 1000;
            font-size: 14px;
          }

          .context-menu-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.15s ease;
            color: #333;
          }

          .context-menu-item:hover {
            background-color: #f5f5f5;
          }

          .context-menu-item.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .context-menu-item.disabled:hover {
            background-color: transparent;
          }

          .context-menu-item.delete {
            color: #e74c3c;
          }

          .context-menu-item.delete:hover {
            background-color: #fdf2f2;
          }

          .context-menu-separator {
            height: 1px;
            background-color: #e9ecef;
            margin: 4px 0;
          }

          .context-menu-item svg {
            flex-shrink: 0;
          }
        `}</style>
      </div>
    </>
  );
};

export default ContextMenu;