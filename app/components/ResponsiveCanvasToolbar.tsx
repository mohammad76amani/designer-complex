import React from 'react';
import { useDesigner } from '../contexts/DesignerContext';

const ResponsiveCanvasToolbar: React.FC = () => {
  const { 
    currentBreakpoint, 
    breakpoints, 
    canvasHeight,
    setCurrentBreakpoint,
    setCanvasHeight 
  } = useDesigner();

  const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    marginBottom: '10px'
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    backgroundColor: isActive ? '#0d6efd' : '#ffffff',
    color: isActive ? 'white' : '#495057',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: isActive ? '600' : 'normal',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={toolbarStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#495057' }}>
          Canvas Size:
        </span>
        
        <button
          style={buttonStyle(currentBreakpoint === 'sm')}
          onClick={() => setCurrentBreakpoint('sm')}
          title={`Mobile (${breakpoints.sm}px)`}
        >
          📱 Mobile ({breakpoints.sm}px)
        </button>
        
        <button
          style={buttonStyle(currentBreakpoint === 'lg')}
          onClick={() => setCurrentBreakpoint('lg')}
          title={`Desktop (${breakpoints.lg}px)`}
        >
          🖥️ Desktop ({breakpoints.lg}px)
        </button>
      </div>

      <div style={{ borderLeft: '1px solid #dee2e6', paddingLeft: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#495057' }}>
            Height:
          </span>
          <input
            type="number"
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(Number(e.target.value))}
            style={{
              width: '80px',
              padding: '4px 8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            min="200"
            max="2000"
          />
          <span style={{ fontSize: '12px', color: '#6c757d' }}>px</span>
        </div>
      </div>

      <div style={{ borderLeft: '1px solid #dee2e6', paddingLeft: '15px' }}>
        <span style={{ fontSize: '11px', color: '#6c757d' }}>
          Current: {breakpoints[currentBreakpoint]}×{canvasHeight}
        </span>
      </div>
    </div>
  );
};

export default ResponsiveCanvasToolbar;
