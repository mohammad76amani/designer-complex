import React, { useState, useEffect } from 'react';
import HistoryService from '../services/historyService';

const HistoryPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [historySummary, setHistorySummary] = useState(HistoryService.getHistorySummary());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHistorySummary(HistoryService.getHistorySummary());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}
      >
        📜 History
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '300px',
      maxHeight: '400px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3>History</h3>
        <button onClick={() => setIsOpen(false)}>×</button>
      </div>
      
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>
        Memory: {HistoryService.getMemoryUsage().estimatedSizeKB}KB
      </div>
      
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {historySummary.map((state, index) => (
          <div
            key={index}
            style={{
              padding: '8px',
              backgroundColor: state.isCurrent ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
           
          >
            <div style={{ fontWeight: state.isCurrent ? 'bold' : 'normal' }}>
              {state.description}
            </div>
            <div style={{ color: '#999' }}>
              {state.elementCount} elements • {new Date(state.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;