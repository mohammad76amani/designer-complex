import React from 'react';
import { useHistory } from '../contexts/HistoryContext';

const HistoryPanel: React.FC = () => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    getUndoDescription,
    getRedoDescription
  } = useHistory();

  return (
    <div className="history-panel" style={{
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      border: '1px solid #dee2e6'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>History</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{
            padding: '8px 12px',
            backgroundColor: canUndo ? '#6c757d' : '#e9ecef',
            color: canUndo ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '4px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontSize: '12px'
          }}
          title={getUndoDescription() || 'Nothing to undo'}
        >
          ↶ Undo {getUndoDescription() && `(${getUndoDescription()})`}
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo}
          style={{
            padding: '8px 12px',
            backgroundColor: canRedo ? '#6c757d' : '#e9ecef',
            color: canRedo ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '4px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            fontSize: '12px'
          }}
          title={getRedoDescription() || 'Nothing to redo'}
        >
          ↷ Redo {getRedoDescription() && `(${getRedoDescription()})`}
        </button>
      </div>
    </div>
  );
};

export default HistoryPanel;