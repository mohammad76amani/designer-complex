import React from 'react';
import { ResponsiveCanvasToolbarProps } from '../types/template';

const ResponsiveCanvasToolbar: React.FC<ResponsiveCanvasToolbarProps> = ({
  currentBreakpoint,
  onBreakpointChange,
  breakpoints
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>
        Canvas Size:
      </span>
      
      {/* Mobile/Small Button */}
      <button
        onClick={() => onBreakpointChange('sm')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          backgroundColor: currentBreakpoint === 'sm' ? '#dc3545' : 'white',
          color: currentBreakpoint === 'sm' ? 'white' : '#6c757d',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        title={`Mobile view (${breakpoints.sm}px)`}
      >
        📱 Mobile ({breakpoints.sm}px)
      </button>
      
      {/* Desktop/Large Button */}
      <button
        onClick={() => onBreakpointChange('lg')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          backgroundColor: currentBreakpoint === 'lg' ? '#28a745' : 'white',
          color: currentBreakpoint === 'lg' ? 'white' : '#6c757d',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        title={`Desktop view (${breakpoints.lg}px)`}
      >
        💻 Desktop ({breakpoints.lg}px)
      </button>
      
      {/* Current dimensions display */}
      <div style={{
        marginLeft: '12px',
        padding: '4px 8px',
        backgroundColor: '#e9ecef',
        borderRadius: '3px',
        fontSize: '11px',
        color: '#495057'
      }}>
        Current: {breakpoints[currentBreakpoint]}px width
      </div>
    </div>
  );
};

export default ResponsiveCanvasToolbar;
