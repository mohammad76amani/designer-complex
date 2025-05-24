import React from 'react';
import { AnimationEditorProps } from '../types/template';
import { hoverAnimationOptions, clickAnimationOptions } from '../utils/animationUtils';

const AnimationEditor: React.FC<AnimationEditorProps> = ({ element, onUpdateElement }) => {
  // Initialize animation object if it doesn't exist
  const animation = element.animation || { hover: 'none', click: 'none' };
  
  // Update animation properties
  const updateAnimation = (property: string, value: string) => {
    onUpdateElement({
      ...element,
      animation: {
        ...animation,
        [property]: value
      }
    });
  };
  
  return (
    <div className="animation-editor">
      <div className="control-group">
        <h4>Hover Animation</h4>
        <div className="style-control">
          <label>Effect</label>
          <select
            value={animation.hover || 'none'}
            onChange={(e) => updateAnimation('hover', e.target.value)}
          >
            {hoverAnimationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {animation.hover === 'bg-color' && (
          <div className="style-control">
            <label>Background Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={animation.hoverBgColor || '#3498db'}
                onChange={(e) => updateAnimation('hoverBgColor', e.target.value)}
              />
              <input
                type="text"
                value={animation.hoverBgColor || '#3498db'}
                onChange={(e) => updateAnimation('hoverBgColor', e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        )}
        
        {animation.hover === 'text-color' && (
          <div className="style-control">
            <label>Text Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={animation.hoverTextColor || '#ffffff'}
                onChange={(e) => updateAnimation('hoverTextColor', e.target.value)}
              />
              <input
                type="text"
                value={animation.hoverTextColor || '#ffffff'}
                onChange={(e) => updateAnimation('hoverTextColor', e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        )}
        
        {animation.hover === 'border' && (
          <div className="style-control">
            <label>Border Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={animation.hoverBorderColor || '#3498db'}
                onChange={(e) => updateAnimation('hoverBorderColor', e.target.value)}
              />
              <input
                type="text"
                value={animation.hoverBorderColor || '#3498db'}
                onChange={(e) => updateAnimation('hoverBorderColor', e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="control-group">
        <h4>Click Animation</h4>
        <div className="style-control">
          <label>Effect</label>
          <select
            value={animation.click || 'none'}
            onChange={(e) => updateAnimation('click', e.target.value)}
          >
            {clickAnimationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {animation.click === 'bg-color' && (
          <div className="style-control">
            <label>Background Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={animation.clickBgColor || '#2980b9'}
                onChange={(e) => updateAnimation('clickBgColor', e.target.value)}
              />
              <input
                type="text"
                value={animation.clickBgColor || '#2980b9'}
                onChange={(e) => updateAnimation('clickBgColor', e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        )}
        
        {animation.click === 'text-color' && (
          <div className="style-control">
            <label>Text Color</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={animation.clickTextColor || '#ffffff'}
                onChange={(e) => updateAnimation('clickTextColor', e.target.value)}
              />
              <input
                type="text"
                value={animation.clickTextColor || '#ffffff'}
                onChange={(e) => updateAnimation('clickTextColor', e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationEditor;
