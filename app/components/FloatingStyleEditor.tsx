import React, { useState, useEffect, useRef } from 'react';
import { useDesigner } from '../contexts/DesignerContext';
import AnimationEditor from './AnimationEditor';
import ElementManagementService from '../services/elementManagementService';

const FloatingStyleEditor: React.FC = () => {
  const {
    selectedElement,
    updateElement,
    closeStyleEditor
  } = useDesigner();
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('style'); // 'style', 'content', 'effects', 'animation'

  if (!selectedElement) return null;

  // Set initial position based on element position
  useEffect(() => {
    // Position the editor to the right of the element
    const x = selectedElement.style.x + (selectedElement.style.width as number) + 20;
    // Align with the top of the element
    const y = selectedElement.style.y;

    // Adjust if it would go off-screen
    const adjustedX = Math.min(x, window.innerWidth - 280);
    const adjustedY = Math.min(y, window.innerHeight - 300);

    setPosition({ x: adjustedX, y: adjustedY });
  }, [selectedElement]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        closeStyleEditor();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeStyleEditor]);

  // Update element style
  const updateStyle = (property: string, value: any) => {
    let updatedElement = { ...selectedElement };

    if (property.includes('.')) {
      const [parent, child] = property.split('.');
      if (parent === 'animation') {
        const currentAnimation = selectedElement.animation || {};
        updatedElement = {
          ...selectedElement,
          animation: {
            ...currentAnimation,
            [child]: value,
            click: 'none'
          }
        };
      }
    } else {
      if (selectedElement.type === 'shape' && property === 'backgroundColor') {
        updatedElement = {
          ...selectedElement,
          style: {
            ...selectedElement.style,
            backgroundColor: 'rgba(255, 0, 0, 0)',
            color: value
          }
        };
      } else {
        updatedElement = {
          ...selectedElement,
          style: {
            ...selectedElement.style,
            [property]: value
          }
        };
      }
    }

    // Validate before updating
    const validation = ElementManagementService.validateElement(updatedElement);
    if (validation.isValid) {
      updateElement(updatedElement);
    } else {
      console.warn('Element validation failed:', validation.errors);
      // Still update but log warnings
      updateElement(updatedElement);
    }
  };

  // Update element attributes (src, href, alt)
  const updateAttribute = (attribute: string, value: string | boolean) => {
    console.log(`Updating attribute: ${attribute} to value: ${value}`);
    updateElement({
      ...selectedElement,
      [attribute]: value
    });
  };



  // Update element content
  const updateContent = (value: string) => {
    updateElement({
      ...selectedElement,
      content: value
    });
  };

  // Render color picker
  const renderColorPicker = (label: string, property: string, value: string | undefined) => (
  <div className="style-control">
    <label>{label}</label>
    <div className="color-picker-container">
      <input
        type="color"
        value={value || '#000000'} // Always provide a default value
        onChange={(e) => updateStyle(property, e.target.value)}
      />
      <input
        type="text"
        value={value || '#000000'} // Always provide a default value
        onChange={(e) => updateStyle(property, e.target.value)}
        placeholder="#RRGGBB"
      />
    </div>
  </div>
);
  // Render number input with slider
  const renderNumberInput = (
  label: string,
  property: string,
  value: number | undefined,
  min: number,
  max: number,
  step: number = 1,
  unit: string = 'px'
) => (
  <div className="style-control">
    <label>{label}</label>
    <div className="number-input-container">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? 0} // Use nullish coalescing for better undefined handling
        onChange={(e) => updateStyle(property, parseFloat(e.target.value))}
      />
      <div className="number-input-value">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? 0} // Use nullish coalescing
          onChange={(e) => updateStyle(property, parseFloat(e.target.value))}
        />
        <span>{unit}</span>
      </div>
    </div>
  </div>
);


  // Render select dropdown
const renderSelect = (
  label: string,
  property: string,
  value: string | undefined,
  options: { value: string, label: string }[]
) => (
  <div className="style-control">
    <label>{label}</label>
    <select
      value={value || options[0]?.value || ''} // Provide default value
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStyle(property, e.target.value)}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

  // Render text input
 const renderTextInput = (
  label: string,
  property: string,
  value: string | undefined
) => (
  <div className="style-control">
    <label>{label}</label>
    <input
      type="text"
      value={value || ''} // Always provide a default value
      onChange={(e) => updateAttribute(property, e.target.value)}
      placeholder={label}
    />
  </div>
);

  // Render text area
 const renderTextArea = (
  label: string,
  value: string | undefined
) => (
  <div className="style-control">
    <label>{label}</label>
    <textarea
      value={value || ''} // Always provide a default value
      onChange={(e) => updateContent(e.target.value)}
      rows={3}
      placeholder={label}
    />
  </div>
);

  // Render style tab content
 const renderStyleTab = () => (
  <div className="tab-content">
    {/* Background and Border - common to most elements */}
    <div className="control-group">
      <h4>Appearance</h4>
      {renderColorPicker('Background', 'backgroundColor', selectedElement.style.backgroundColor || 'transparent')}
      {renderNumberInput('Border Radius', 'borderRadius', selectedElement.style.borderRadius || 0, 0, 100)}
      {renderNumberInput('Z-Index', 'zIndex', selectedElement.style.zIndex || 0, 0, 1000, 1, '')}
      {renderNumberInput('Opacity', 'opacity', selectedElement.style.opacity ?? 1, 0, 1, 0.1, '')}
    </div>

    {/* Typography section */}
    {(selectedElement.type === 'button' || selectedElement.type === 'paragraph' || selectedElement.type === 'heading') && (
      <div className="control-group">
        <h4>Typography</h4>
        {renderColorPicker('Text Color', 'color', selectedElement.style.color || '#000000')}
        {renderNumberInput('Font Size', 'fontSize', selectedElement.style.fontSize || 16, 8, 72)}
   {renderSelect('Font Weight', 'fontWeight', selectedElement.style.fontWeight || '400', [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
])}
        {renderSelect('Text Align', 'textAlign', selectedElement.style.textAlign || 'left', [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ])}
        {renderNumberInput('Padding', 'padding', selectedElement.style.padding || 0, 0, 50)}
        {renderNumberInput('Letter Spacing', 'letterSpacing', selectedElement.style.letterSpacing ?? 0, -5, 10, 0.1, 'px')}
        {renderNumberInput('Line Height', 'lineHeight', selectedElement.style.lineHeight ?? 1.5, 0.5, 3, 0.1, '')}
      </div>
    )}

    {/* Border controls */}
    <div className="control-group">
      <h4>Border</h4>
      {renderNumberInput('Border Width', 'borderWidth', selectedElement.style.borderWidth ?? 0, 0, 20, 1, 'px')}
      {renderSelect('Border Style', 'borderStyle', selectedElement.style.borderStyle || 'none', [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ])}
      {renderColorPicker('Border Color', 'borderColor', selectedElement.style.borderColor || '#000000')}
    </div>

    {/* Shadow controls */}
    <div className="control-group">
      <h4>Shadow</h4>
      {renderNumberInput('Shadow Blur', 'boxShadowBlur', selectedElement.style.boxShadowBlur ?? 0, 0, 50, 1, 'px')}
      {renderNumberInput('Shadow Spread', 'boxShadowSpread', selectedElement.style.boxShadowSpread ?? 0, 0, 50, 1, 'px')}
      {renderColorPicker('Shadow Color', 'boxShadowColor', selectedElement.style.boxShadowColor || 'rgba(0,0,0,0.2)')}
    </div>
  </div>
);


  // Render content tab
const renderContentTab = () => (
  <div className="tab-content">
    {/* Text content */}
    {(selectedElement.type === 'button' || selectedElement.type === 'paragraph' || selectedElement.type === 'heading') && (
      <div className="control-group">
        <h4>Text Content</h4>
        {renderTextArea('Content', selectedElement.content)}
      </div>
    )}

    {/* Button-specific controls */}
    {selectedElement.type === 'button' && (
      <div className="control-group">
        <h4>Button Properties</h4>
        {renderTextInput('Link URL', 'href', selectedElement.href)}
        {renderSelect('Open Link In', 'target', selectedElement.target || '_self', [
          { value: '_self', label: 'Same Window' },
          { value: '_blank', label: 'New Window' }
        ])}
      </div>
    )}

    {/* Image-specific controls */}
    {selectedElement.type === 'image' && (
      <div className="control-group">
        <h4>Image Properties</h4>
        {renderTextInput('Image URL', 'src', selectedElement.src)}
        {renderTextInput('Alt Text', 'alt', selectedElement.alt)}
        {renderSelect('Image Fit', 'objectFit', selectedElement.style.objectFit || 'cover', [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
          { value: 'none', label: 'None' }
        ])}
      </div>
    )}

    {/* Shape-specific controls */}
    {selectedElement.type === 'shape' && (
      <div className="control-group">
        <h4>Shape Properties</h4>
        <div className="style-control">
          <label>Shape Type</label>
          <select
            value={selectedElement.shapeType || 'rectangle'}
            onChange={(e) => {
              const newShapeType = e.target.value;
              console.log(`Changing shape type to: ${newShapeType} for element ID: ${selectedElement.id}`);

              const updatedElement = {
                ...selectedElement,
                shapeType: newShapeType
              };

              console.log('Updated element:', updatedElement);
              updateElement(updatedElement);
            }}
          >
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
            <option value="arrow">Arrow</option>
            <option value="star">Star</option>
          </select>
        </div>
      </div>
    )}

    {/* Video-specific controls */}
    {selectedElement.type === 'video' && (
      <div className="control-group">
        <h4>Video Properties</h4>
        {renderTextInput('Video URL', 'videoSrc', selectedElement.videoSrc)}

        <div className="style-control">
          <label>Video Options</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedElement.autoplay || false}
                onChange={(e) => updateAttribute('autoplay', e.target.checked)}
              />
              Autoplay
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedElement.loop || false}
                onChange={(e) => updateAttribute('loop', e.target.checked)}
              />
              Loop
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedElement.muted || false}
                onChange={(e) => updateAttribute('muted', e.target.checked)}
              />
              Muted
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedElement.controls !== false} // Default to true
                onChange={(e) => updateAttribute('controls', e.target.checked)}
              />
              Show Controls
            </label>
          </div>
        </div>

        {renderSelect('Video Fit', 'objectFit', selectedElement.style.objectFit || 'cover', [
          { value: 'cover', label: 'Cover' },
          { value: 'contain', label: 'Contain' },
          { value: 'fill', label: 'Fill' },
          { value: 'none', label: 'None' }
        ])}
      </div>
    )}
  </div>
);



  // Render effects tab
  const renderEffectsTab = () => (
    <div className="tab-content">
  

      <div className="control-group">
        <h4>Filters</h4>
        {renderNumberInput('Blur', 'blur', selectedElement.style.blur ?? 0, 0, 20, 0.5, 'px')}
        {renderNumberInput('Brightness', 'brightness', selectedElement.style.brightness ?? 100, 0, 200, 5, '%')}
        {renderNumberInput('Contrast', 'contrast', selectedElement.style.contrast ?? 100, 0, 200, 5, '%')}
      </div>
      
    </div>
  );

  // Add this function to debug font weight
  const debugFontWeight = () => {
    console.log('Current element font weight:', selectedElement.style.fontWeight);
    console.log('Font family being used:', getComputedStyle(document.body).fontFamily);
    
    // Test if Inter font is loaded
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'Inter';
    testElement.style.fontWeight = '100';
    testElement.textContent = 'Test';
    document.body.appendChild(testElement);
    
    const computedStyle = getComputedStyle(testElement);
    console.log('Computed font family:', computedStyle.fontFamily);
    console.log('Computed font weight:', computedStyle.fontWeight);
    
    document.body.removeChild(testElement);
  };

  return (
    <div
      ref={editorRef}
      className="floating-style-editor"
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: '280px',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        borderRadius: '8px',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      <div className="editor-header">
        <h3>{selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties</h3>
        <button className="close-button" onClick={closeStyleEditor}>×</button>
      </div>

      <div className="editor-tabs">
        <button
          className={`tab-button ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`tab-button ${activeTab === 'effects' ? 'active' : ''}`}
          onClick={() => setActiveTab('effects')}
        >
          Effects
        </button>
        <button
          className={`tab-button ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          Animation
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'effects' && renderEffectsTab()}
        {activeTab === 'animation' && <AnimationEditor element={selectedElement} onUpdateElement={updateElement} />}
      </div>

      <style jsx>{`
        .floating-style-editor {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          animation: fadeIn 0.2s ease-out;
          user-select: none;
        }
        
               .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .editor-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #343a40;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          color: #6c757d;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .close-button:hover {
          background-color: #e9ecef;
          color: #343a40;
        }
        
        .editor-tabs {
          display: flex;
          border-bottom: 1px solid #e9ecef;
        }
        
        .tab-button {
          flex: 1;
          padding: 10px 12px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          color: #6c757d;
          font-size: 13px;
          transition: all 0.2s;
        }
        
        .tab-button:hover {
          background-color: #f8f9fa;
          color: #343a40;
        }
        
        .tab-button.active {
          border-bottom-color: #0d6efd;
          color: #0d6efd;
          font-weight: 500;
        }
        
        .editor-content {
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .control-group {
          margin-bottom: 16px;
        }
        
        .control-group h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
          font-weight: 600;
          color: #495057;
        }
        
        .style-control {
          margin-bottom: 12px;
        }
        
        .style-control label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: #6c757d;
        }
        
        .style-controls-row {
          display: flex;
          gap: 12px;
        }
        
        .style-control.half {
          flex: 1;
        }
        
        .color-picker-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .color-picker-container input[type="color"] {
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .color-picker-container input[type="text"] {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 12px;
        }
        
        .number-input-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .number-input-container input[type="range"] {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: #dee2e6;
          border-radius: 2px;
        }
        
        .number-input-container input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0d6efd;
          cursor: pointer;
        }
        
        .number-input-value {
          display: flex;
          align-items: center;
        }
        
        .number-input-value input {
          width: 50px;
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 12px;
          text-align: right;
        }
        
        .number-input-value span {
          margin-left: 4px;
          font-size: 12px;
          color: #6c757d;
        }
        
        select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 12px;
          background-color: white;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
        }
        
        input[type="text"], textarea {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 12px;
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        input[type="text"]:focus, 
        input[type="number"]:focus, 
        select:focus, 
        textarea:focus {
          border-color: #0d6efd;
          outline: none;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }
        
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #495057;
          cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        
        .coming-soon {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 12px;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Scrollbar styling */
        .editor-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .editor-content::-webkit-scrollbar-track {
          background: #f1f3f5;
        }
        
        .editor-content::-webkit-scrollbar-thumb {
          background-color: #ced4da;
          border-radius: 3px;
        }
        
        .editor-content::-webkit-scrollbar-thumb:hover {
          background-color: #adb5bd;
        }
      `}</style>
    </div>
  );
};

export default FloatingStyleEditor;