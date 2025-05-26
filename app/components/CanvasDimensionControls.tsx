import React, { useState, useEffect } from 'react';
import { CanvasDimensionControlsProps } from '../types/template';



const CanvasDimensionControls: React.FC<CanvasDimensionControlsProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  onSizeChange
}) => {
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);

  useEffect(() => {
    setLocalWidth(width);
    setLocalHeight(height);
  }, [width, height]);

  const handleWidthSubmit = () => {
    if (localWidth !== width) {
      onWidthChange(localWidth);
    }
  };

  const handleHeightSubmit = () => {
    if (localHeight !== height) {
      onHeightChange(localHeight);
    }
  };

  const presetSizes = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1200, height: 800 },
    { name: 'HD', width: 1920, height: 1080 }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      border: '1px solid #dee2e6'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Width:</label>
        <input
          type="number"
          value={localWidth}
          onChange={(e) => setLocalWidth(Number(e.target.value))}
          onBlur={handleWidthSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleWidthSubmit()}
          style={{
            width: '80px',
            padding: '4px 6px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            fontSize: '12px'
          }}
          min="200"
          max="5000"
        />
        <span style={{ fontSize: '12px', color: '#666' }}>px</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Height:</label>
        <input
          type="number"
          value={localHeight}
          onChange={(e) => setLocalHeight(Number(e.target.value))}
          onBlur={handleHeightSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleHeightSubmit()}
          style={{
            width: '80px',
            padding: '4px 6px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            fontSize: '12px'
          }}
          min="200"
          max="5000"
        />
        <span style={{ fontSize: '12px', color: '#666' }}>px</span>
      </div>

      <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', marginRight: '5px' }}>Presets:</label>
        <select
          onChange={(e) => {
            const preset = presetSizes.find(p => p.name === e.target.value);
            if (preset) {
              setLocalWidth(preset.width);
              setLocalHeight(preset.height);
              onSizeChange(preset.width, preset.height);
            }
          }}
          style={{
            padding: '4px 6px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            fontSize: '12px'
          }}
          defaultValue=""
        >
          <option value="">Select preset...</option>
          {presetSizes.map(preset => (
            <option key={preset.name} value={preset.name}>
              {preset.name} ({preset.width}×{preset.height})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CanvasDimensionControls;