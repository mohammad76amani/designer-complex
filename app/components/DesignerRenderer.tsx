import React, { useState, useEffect, useRef } from 'react';
import { Template, Element } from '@/app/types/template';
import CanvasRenderer from './CanvasRenderer';
import ContextMenu from './ContextMenu';
import FloatingStyleEditor from './FloatingStyleEditor';
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
