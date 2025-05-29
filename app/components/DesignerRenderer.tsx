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
          sections: template.sections.children.sections?.map(section => 
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
          sections: template.sections.children.sections?.map(section => 
            section.type === 'designer' 
              ? {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    setting: section.blocks?.setting ? {
                      ...section.blocks.setting,
                      canvasWidth: breakpoint
                    } : undefined,
                    settings: section.blocks?.settings ? {
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
          sections: template?.sections?.children?.sections?.map(section => 
            section.type === 'designer' 
              ? {
                  ...section,
                  blocks: {
                    ...section.blocks,
                    setting: section.blocks?.setting ? {
                      ...section.blocks.setting,
                      canvasHeight: height
                    } : undefined,
                    settings: section.blocks?.settings ? {
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
          initialCanvasHeight={initialCanvasHeight}
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
    selectedElementIds,
    canvasRef,
    clipboard,
    elements,
    updateElement,
    updateElements,
    closeStyleEditor,
    closeContextMenu,
    deleteElement,
    setClipboard
  } = useDesigner();

  // Group/Ungroup functionality
  const handleGroup = () => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    
    if (selectedElements.length < 2) return;

    // Calculate group bounds
    const positions = selectedElements.map(el => ({
      x: el.style.x,
      y: el.style.y,
      width: typeof el.style.width === 'number' ? el.style.width : parseFloat(el.style.width),
      height: typeof el.style.height === 'number' ? el.style.height : parseFloat(el.style.height)
    }));

    const minX = Math.min(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxX = Math.max(...positions.map(p => p.x + p.width));
    const maxY = Math.max(...positions.map(p => p.y + p.height));

    const bounds = {
      x: minX - 10,
      y: minY - 10,
      width: maxX - minX + 20,
      height: maxY - minY + 20
    };
    
    // Create new group element
    const groupId = `group-${Date.now()}`;
    const groupElement = {
      id: groupId,
      type: 'group' as const,
      style: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        zIndex: Math.max(...selectedElements.map(el => el.style.zIndex || 0)) + 1
      },
      content: {},
      parentId: undefined
    };

    // Update selected elements to be children of the group
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return {
          ...el,
          parentId: groupId,
          style: {
            ...el.style,
            x: el.style.x - bounds.x,
            y: el.style.y - bounds.y
          }
        };
      }
      return el;
    });

    // Add the group element
    const newElements = [...updatedElements, groupElement];
    updateElements(newElements);
    closeContextMenu();
  };

  const handleUngroup = () => {
    if (!contextMenu.element || contextMenu.element.type !== 'group') return;

    const groupElement = contextMenu.element;
    const childElements = elements.filter(el => el.parentId === groupElement.id);
    
    // Update child elements to be top-level and adjust their positions
    const updatedElements = elements.map(el => {
      if (el.parentId === groupElement.id) {
        return {
          ...el,
          parentId: undefined,
          style: {
            ...el.style,
            x: el.style.x + groupElement.style.x,
            y: el.style.y + groupElement.style.y
          }
        };
      }
      return el;
    }).filter(el => el.id !== groupElement.id); // Remove the group element

    updateElements(updatedElements);
    closeContextMenu();
  };

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
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const canvasX = contextMenu.x - canvasRect.left;
      const canvasY = contextMenu.y - canvasRect.top;
      
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

        {/* Enhanced context menu with group/ungroup options */}
        {contextMenu.show && (
          <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            onGroup={selectedElementIds.length > 1 ? handleGroup : undefined}
            onUngroup={contextMenu.element?.type === 'group' ? handleUngroup : undefined}
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
