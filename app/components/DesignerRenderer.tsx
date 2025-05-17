import React, { useState, useEffect, useRef } from 'react';
import { Template, Element } from '@/app/types/template';
import CanvasRenderer from './CanvasRenderer';
import ContextMenu from './ContextMenu';
import FloatingStyleEditor from './FloatingStyleEditor';
import ElementToolbar from './ElementToolbar';
import { DesignerRendererProps } from '@/app/types/template';

const DesignerRenderer: React.FC<DesignerRendererProps> = ({ template }) => {
  // Find the designer section in the template
  const designerSection = template?.sections?.children?.sections?.find(
    section => section.type === 'designer'
  );
  const [showStyleEditor, setShowStyleEditor] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [elements, setElements] = useState<Element[]>(
    designerSection?.blocks?.elements || []
  );
  const [clipboard, setClipboard] = useState<Element | null>(null);
  
  // Get default element style
  const getDefaultElementStyle = () => {
    return {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
      borderRadius: 0,
      padding: 0,
      textAlign: 'left',
      zIndex: 1,
      opacity: 1
    };
  };
  
  // Create a new element based on type
  const createNewElement = (type: string, options?: any): Element => {
    const baseStyle = getDefaultElementStyle();
    const id = `${type}-${Date.now()}`;
    
    switch (type) {
      case 'heading':
        return {
          id,
          type,
          content: 'New Heading',
          style: {
            ...baseStyle,
            fontSize: 32,
            fontWeight: 'bold'
          }
        };
        
      case 'paragraph':
        return {
          id,
          type,
          content: 'New paragraph text. Click to edit.',
          style: {
            ...baseStyle,
            height: 150
          }
        };
        
      case 'button':
        return {
          id,
          type,
          content: 'Button',
          href: '#',
          style: {
            ...baseStyle,
            width: 120,
            height: 40,
            backgroundColor: '#3498db',
            color: '#ffffff',
            borderRadius: 4,
            textAlign: 'center',
            fontWeight: 'bold'
          }
        };
        
      case 'image':
        return {
          id,
          type,
          content: '',
          src: 'https://via.placeholder.com/200x100',
          alt: 'Placeholder image',
          style: {
            ...baseStyle,
            backgroundColor: 'transparent'
          }
        };
        
      case 'video':
        return {
          id,
          type,
          content: '',
          videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true,
          style: {
            ...baseStyle,
            backgroundColor: '#000000'
          }
        };
        
      case 'shape':
        const shapeType = options?.shapeType || 'rectangle';
        return {
          id,
          type,
          content: '',
          shapeType,
          style: {
            ...baseStyle,
            width: 100,
            height: 100,
            backgroundColor: shapeType === 'line' ? 'transparent' : '#3498db',
            borderWidth: shapeType === 'line' ? 2 : 0,
            borderStyle: shapeType === 'line' ? 'solid' : 'none',
            borderColor: shapeType === 'line' ? '#3498db' : '#000000',
            zIndex: 1
          }
        };
        
      default:
        return {
          id,
          type,
          content: 'Unknown element',
          style: baseStyle
        };
    }
  };
  
  // Handle adding a new element
  const handleAddElement = (elementType: string) => {
    const newElement = createNewElement(elementType);
    setElements([...elements, newElement]);
    setSelectedElement(newElement);
    setShowStyleEditor(true);
  };
  
  // Handle adding a new shape
 const handleAddShape = (shapeType: string) => {
  const newId = `shape-${Date.now()}`;
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  
  if (!canvasRect) return;
  
  // Create a new shape element positioned at the center of the canvas
  const newElement: Element = {
    id: newId,
    type: 'shape',
    shapeType: shapeType,
    content: '',
    style: {
      x: canvasRect.width / 2 - 75, // Center horizontally
      y: canvasRect.height / 2 - 75, // Center vertically
      width: 150,
      height: 150,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: '#3498db',
      borderRadius: 0,
      padding: 0,
      textAlign: 'left',
      zIndex: 1,
      opacity: 1,
      borderWidth: 0,
      borderStyle: 'none',
      borderColor: '#000000'
    }
  };
  
  // Add the new element to the canvas
  setElements([...elements, newElement]);
  
  // Select the new element
  setSelectedElement(newElement);
};

  const handleOpenStyleEditor = (element: Element) => {
    setSelectedElement(element);
    setShowStyleEditor(true);
  };

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    element: Element | null;
  }>({
    show: false,
    x: 0,
    y: 0,
    element: null
  });

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

  // Function to handle element selection
  const handleSelectElement = (element: Element) => {
    setSelectedElement(element);
    // Close context menu when selecting a new element
    setContextMenu({ ...contextMenu, show: false });
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

  // Function to handle context menu
  const handleElementContextMenu = (element: Element, x: number, y: number) => {
    // Show context menu for the right-clicked element without changing selection
    setContextMenu({
      show: true,
      x,
      y,
      element
    });
  };
  
  // Function to handle right-click on the canvas
  const handleCanvasContextMenu = (x: number, y: number) => {
    // Show context menu for the canvas (no element selected)
    setContextMenu({
      show: true,
      x,
      y,
      element: null
    });
  };

  // Function to close context menu
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, show: false });
  };

  // Function to delete the element from context menu
  const deleteElement = () => {
    if (contextMenu.element) {
      const filteredElements = elements.filter(el => el.id !== contextMenu.element?.id);
      setElements(filteredElements);

      // If the deleted element was selected, clear selection
      if (selectedElement && selectedElement.id === contextMenu.element.id) {
        setSelectedElement(null);
        // Also close the style editor if it was open
        setShowStyleEditor(false);
      }

      closeContextMenu();
    }
  };

  const canvasRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // Function to copy the element from context menu
  const copyElement = () => {
    if (contextMenu.element) {
      setClipboard(contextMenu.element);
      closeContextMenu();
    }
  };

  // Function to cut the element from context menu
  const cutElement = () => {
    if (contextMenu.element) {
      setClipboard(contextMenu.element);

      // Remove the element from the canvas
      const filteredElements = elements.filter(el => el.id !== contextMenu.element?.id);
      setElements(filteredElements);

      // If the cut element was selected, clear selection
      if (selectedElement && selectedElement.id === contextMenu.element.id) {
        setSelectedElement(null);
      }

      closeContextMenu();
    }
  };

  // Function to paste the copied/cut element
  // Update the pasteElement function to paste at the right-click position
  const pasteElement = () => {
    if (clipboard && canvasRef.current) {
      // Create a new ID for the pasted element
      const newId = `${clipboard.id}-copy-${Date.now()}`;

      // Get canvas position for coordinate adjustment
      const canvasRect = canvasRef.current.getBoundingClientRect();

      // Calculate the position relative to the canvas
      const canvasX = contextMenu.x - canvasRect.left;
      const canvasY = contextMenu.y - canvasRect.top;

      // Create a new element positioned at the right-click location
      const newElement: Element = {
        ...clipboard,
        id: newId,
        style: {
          ...clipboard.style,
          // Position at the right-click location, adjusting to center the element
          x: Math.max(0, canvasX - (clipboard.style.width as number) / 2),
          y: Math.max(0, canvasY - (clipboard.style.height as number) / 2)
        }
      };

      // Add the new element to the canvas
      setElements([...elements, newElement]);

      // Select the new element
      setSelectedElement(newElement);

      // Close the context menu
      closeContextMenu();
    }
  };

  // Add keyboard shortcuts for copy, cut, paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      const isInputActive = document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if (isInputActive) return;

      // Delete key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        const filteredElements = elements.filter(el => el.id !== selectedElement.id);
        setElements(filteredElements);
        setSelectedElement(null);
      }

      // Copy (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement) {
        e.preventDefault();
        setClipboard(selectedElement);
      }

      // Cut (Ctrl+X or Cmd+X)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedElement) {
        e.preventDefault();
        setClipboard(selectedElement);
        const filteredElements = elements.filter(el => el.id !== selectedElement.id);
        setElements(filteredElements);
        setSelectedElement(null);
      }

      // Paste (Ctrl+V or Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        pasteElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, elements, clipboard]);
  
  // Add this useEffect to ensure showStyleEditor is false when no element is selected
  useEffect(() => {
    if (!selectedElement && showStyleEditor) {
      setShowStyleEditor(false);
    }
  }, [selectedElement, showStyleEditor]);

  return (
    <div className="designer-container" style={sectionStyle}>
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
          <div style={{ fontSize: '14px', color: '#666' }}>
            {clipboard && (
              <button
                onClick={pasteElement}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Paste Element
              </button>
            )}
          </div>
        </div>

        <ElementToolbar 
  onAddElement={handleAddElement} 
  onAddShape={handleAddShape} 
/>

        <CanvasRenderer 
          blocks={{ 
            ...blocks, 
            elements: elements 
          }} 
          onSelectElement={handleSelectElement}
          selectedElementId={selectedElement?.id}
          onUpdateElement={handleUpdateElement}
          onElementContextMenu={handleElementContextMenu}
          onCanvasContextMenu={handleCanvasContextMenu}
          onCloseContextMenu={closeContextMenu}
          canvasRef={canvasRef}
          onOpenStyleEditor={handleOpenStyleEditor}
        />

        {/* Render context menu when shown */}
        {contextMenu.show && (
          <ContextMenu 
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={closeContextMenu}
            onDelete={deleteElement}
            onCopy={copyElement}
            onCut={cutElement}
            onPaste={pasteElement}
            canPaste={clipboard !== null}
          />
        )}
        
        {selectedElement && showStyleEditor && (
          <FloatingStyleEditor 
            element={selectedElement}
            onUpdateElement={handleUpdateElement}
            onClose={() => setShowStyleEditor(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DesignerRenderer;
