import React, { useEffect, useState } from 'react';
import { Template, Element } from '@/app/types/template';
import CanvasRenderer from './CanvasRenderer';

interface DesignerRendererProps {
  template: Template;
}

const DesignerRenderer: React.FC<DesignerRendererProps> = ({ template }) => {
  // Find the designer section in the template
  const designerSection = template.sections.children.sections.find(
    section => section.type === 'designer'
  );

  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [elements, setElements] = useState<Element[]>(
    designerSection?.blocks.elements || []
  );

  if (!designerSection) {
    return <div>No designer section found in template</div>;
  }

  const { setting, blocks } = designerSection;
  
  const sectionStyle: React.CSSProperties = {
    paddingTop: `${setting.paddingTop}px`,
    paddingBottom: `${setting.paddingBottom}px`,
    paddingLeft: `${setting.paddingLeft}px`,
    paddingRight: `${setting.paddingRight}px`,
    marginTop: `${setting.marginTop}px`,
    marginBottom: `${setting.marginBottom}px`,
    backgroundColor: setting.backgroundColor,
    fontFamily: template.settings.fontFamily,
  };
// Add this inside the component
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
      // Prevent backspace from navigating back
      if (e.key === 'Backspace') {
        e.preventDefault();
      }
      
      // Remove the selected element
      const filteredElements = elements.filter(el => el.id !== selectedElement.id);
      setElements(filteredElements);
      setSelectedElement(null);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [selectedElement, elements]);

  // Function to handle element selection
  const handleSelectElement = (element: Element) => {
    setSelectedElement(element);
  };

  // Function to update element position and size
  const handleUpdateElement = (updatedElement: Element) => {
    const updatedElements = elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    setElements(updatedElements);
    
    // Update the selected element reference as well
    if (selectedElement && selectedElement.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
  };

  return (
    <div className="designer-container" style={sectionStyle}>
      <div style={{ position: 'relative' }}>
        // Add this before the CanvasRenderer
<div style={{ 
  padding: '10px', 
  backgroundColor: '#f0f0f0', 
  borderRadius: '8px 8px 0 0',
  borderBottom: '1px solid #ddd',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}}>
  <div>
    <h3 style={{ margin: 0 }}>Canvas Editor</h3>
  </div>
  <div style={{ fontSize: '14px', color: '#666' }}>
    {selectedElement ? 
      'Drag to move, use handles to resize, press Delete to remove' : 
      'Click on an element to select it'}
  </div>
</div>

        <CanvasRenderer 
          blocks={{ 
            ...blocks, 
            elements: elements 
          }} 
          onSelectElement={handleSelectElement}
          selectedElementId={selectedElement?.id}
          onUpdateElement={handleUpdateElement}
        />
        
        {selectedElement && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Selected Element: {selectedElement.type}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>Position</h4>
                <p style={{ margin: '0' }}>X: {Math.round(selectedElement.style.x)}, Y: {Math.round(selectedElement.style.y)}</p>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <h4 style={{ margin: '0 0 5px 0' }}>Size</h4>
                <p style={{ margin: '0' }}>Width: {Math.round(Number(selectedElement.style.width))}, Height: {Math.round(Number(selectedElement.style.height))}</p>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Tip: Drag to move, use handles to resize
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerRenderer;
