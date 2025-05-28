import React from 'react';
import { DesignerProvider } from '../contexts/DesignerContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { useDesigner } from '../contexts/DesignerContext';
import CanvasRenderer from './CanvasRenderer';
import ContextMenu from './ContextMenu';
import FloatingStyleEditor from './FloatingStyleEditor';
import ElementToolbar from './ElementToolbar';
import ResponsiveCanvasToolbar from './ResponsiveCanvasToolbar';
import { DesignerRendererProps, DirectionSetting } from '@/app/types/template';

const DesignerRenderer: React.FC<DesignerRendererProps> = ({ template, onTemplateUpdate }) => {
  const designerSection = template?.sections?.children?.sections?.find(
    section => section.type === 'designer'
  );

  if (!designerSection) {
    return <div>No designer section found in template</div>;
  }

  const initialElements = designerSection?.blocks?.elements || [];
  const settings = designerSection?.blocks?.setting || designerSection?.blocks?.settings;
  const initialCanvasHeight = parseFloat(String(settings?.canvasHeight || 600));
  
  const handleTemplateUpdate = (elements: any[]) => {
    if (!onTemplateUpdate) return;
    
    const updatedTemplate = {
      ...template,
      sections: {
        ...template.sections,
        children: {
          ...template.sections.children,
          sections: template.sections.children.sections.map(section => 
            section.type === 'designer' 
              ? {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    elements: elements
                  }
                }
              : section
          )
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
  };

  const handleBreakpointChange = (breakpoint: 'sm' | 'lg') => {
    if (!onTemplateUpdate) return;
    
    const updatedTemplate = {
      ...template,
      sections: {
        ...template.sections,
        children: {
          ...template.sections.children,
          sections: template.sections.children.sections.map(section => 
            section.type === 'designer' 
              ? {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    setting: section.blocks.setting ? {
                      ...section.blocks.setting,
                      canvasWidth: breakpoint
                    } : undefined,
                    settings: section.blocks.settings ? {
                      ...section.blocks.settings,
                      canvasWidth: breakpoint
                    } : undefined
                  }
                }
              : section
          )
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
  };

  const handleCanvasHeightUpdate = (height: number) => {
    if (!onTemplateUpdate) return;
    
    const updatedTemplate = {
      ...template,
      sections: {
        ...template.sections,
        children: {
          ...template.sections.children,
          sections: template.sections.children.sections.map(section => 
            section.type === 'designer' 
              ? {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    setting: section.blocks.setting ? {
                      ...section.blocks.setting,
                      canvasHeight: height
                    } : undefined,
                    settings: section.blocks.settings ? {
                      ...section.blocks.settings,
                      canvasHeight: height
                    } : undefined
                  }
                }
              : section
          )
        }
      }
    };
    
    onTemplateUpdate(updatedTemplate);
  };

  const handleHistoryChange = (elements: any[], selectedElementIds: string[], selectedElementId: string | null) => {
    // Handle history state changes
    handleTemplateUpdate(elements);
  };

  const { setting } = designerSection;

  const sectionStyle: DirectionSetting = {
    paddingTop: `${setting?.paddingTop}px`,
    paddingBottom: `${setting?.paddingBottom}px`,
    paddingLeft: `${setting?.paddingLeft}px`,
    paddingRight: `${setting?.paddingRight}px`,
    marginTop: `${setting?.marginTop}px`,
    marginBottom: `${setting?.marginBottom}px`,
    backgroundColor: `#${setting?.backgroundColor?.toString() || "000000"}`,
  };

  return (
    <div className="designer-container" style={sectionStyle}>
      <HistoryProvider onHistoryChange={handleHistoryChange}>
        <DesignerProvider
          initialElements={initialElements}
          initialBreakpoint={settings?.canvasWidth === 'sm' ? 'sm' : 'lg'}
          initialBreakpoints={settings?.breakpoints || { sm: 400, lg: 1000 }}
          initialCanvasHeight={initialCanvasHeight} // Pass initial canvas height
          onTemplateUpdate={handleTemplateUpdate}
          onBreakpointChange={handleBreakpointChange}
          onCanvasHeightUpdate={handleCanvasHeightUpdate}
        >
          <DesignerContent />
        </DesignerProvider>
      </HistoryProvider>
    </div>
  );
};

const DesignerContent: React.FC = () => {
  const { 
    contextMenu, 
    showStyleEditor, 
    selectedElement,
    canvasRef,
    clipboard,
    updateElement,
    closeStyleEditor,
    closeContextMenu,
    deleteElement,
    setClipboard,
    elements,
    updateElements
  } = useDesigner();

  // Context menu handlers
  const handleDelete = () => {
    if (contextMenu.element) {
      deleteElement(contextMenu.element.id);
      closeContextMenu();
    }
  };

  const handleCopy = () => {
    if (contextMenu.element) {
      setClipboard(contextMenu.element);
      closeContextMenu();
    }
  };

  const handleCut = () => {
    if (contextMenu.element) {
      setClipboard(contextMenu.element);
      deleteElement(contextMenu.element.id);
      closeContextMenu();
    }
  };

  const handlePaste = () => {
    if (clipboard && canvasRef.current) {
      // Get canvas position for coordinate adjustment
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate the position relative to the canvas
      const canvasX = contextMenu.x - canvasRect.left;
      const canvasY = contextMenu.y - canvasRect.top;
      
      // Create new element from clipboard
      const newElement = {
        ...clipboard,
        id: `${clipboard.type}-${Date.now()}`,
        style: {
          ...clipboard.style,
          x: Math.max(0, canvasX - (clipboard.style.width as number) / 2),
          y: Math.max(0, canvasY - (clipboard.style.height as number) / 2),
          zIndex: elements.length + 1
        }
      };
      
      // Add the new element to the canvas
      const newElements = [...elements, newElement];
      updateElements(newElements);
      
      closeContextMenu();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
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
      </div>

      <div style={{ position: 'relative' }}>
        <ElementToolbar />
        <ResponsiveCanvasToolbar />
        <CanvasRenderer />

        {/* Render context menu when shown */}
        {contextMenu.show && (
          <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            canPaste={clipboard !== null}
          />
        )}
        
        {selectedElement && showStyleEditor && (
          <FloatingStyleEditor 
            element={selectedElement}
            onUpdateElement={updateElement}
            onClose={closeStyleEditor}
            canvasRef={canvasRef}
          />
        )}
      </div>
    </div>
  );
};

export default DesignerRenderer;
