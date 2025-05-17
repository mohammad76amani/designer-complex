import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Template, Element } from '@/app/types/template';
import CanvasRenderer from './CanvasRenderer';
import ContextMenu from './ContextMenu';
import FloatingStyleEditor from './FloatingStyleEditor';
import ElementToolbar from './ElementToolbar';
import { DesignerRendererProps } from '@/app/types/template';

// Define a history state type
interface HistoryState {
  elements: Element[];
  selectedElementId: string | null;
}

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
  
  // History management
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false);
  
  // Add a new state to the history when elements change
  useEffect(() => {
    if (isUndoRedo) {
      // If the change is from undo/redo, don't add to history
      setIsUndoRedo(false);
      return;
    }
    
    // Create a new history state
    const newState: HistoryState = {
      elements: [...elements],
      selectedElementId: selectedElement?.id || null
    };
    
    // If we're not at the end of the history, truncate it
    if (historyIndex < history.length - 1) {
      setHistory(prevHistory => prevHistory.slice(0, historyIndex + 1));
    }
    
    // Add the new state to history
    setHistory(prevHistory => [...prevHistory, newState]);
    setHistoryIndex(prevIndex => prevIndex + 1);
  }, [elements]);
  
  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true);
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      
      // Update selected element
      if (prevState.selectedElementId) {
        const selectedEl = prevState.elements.find(el => el.id === prevState.selectedElementId);
        setSelectedElement(selectedEl || null);
      } else {
        setSelectedElement(null);
      }
      
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);
  
  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true);
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      
      // Update selected element
      if (nextState.selectedElementId) {
        const selectedEl = nextState.elements.find(el => el.id === nextState.selectedElementId);
        setSelectedElement(selectedEl || null);
      } else {
        setSelectedElement(null);
      }
      
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);
  
  // Initialize history with initial state
  useEffect(() => {
    const initialState: HistoryState = {
      elements,
      selectedElementId: null
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);
  
  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      const isInputActive = document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      
      if (isInputActive) return;
      
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

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

  // Function to add a new element
  const handleAddElement = (elementType: string) => {
    const newId = `${elementType}-${Date.now()}`;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (!canvasRect) return;
    
    // Default properties for all elements
    const baseElement: Element = {
      id: newId,
      type: elementType,
      content: '',
      style: {
        x: canvasRect.width / 2 - 100, // Center horizontally
        y: canvasRect.height / 2 - 50, // Center vertically
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
        opacity: 1,
        borderWidth: 0,
        borderStyle: 'none',
        borderColor: '#000000',
        boxShadowBlur: 0,
        boxShadowSpread: 0,
        boxShadowColor: 'rgba(0,0,0,0.2)'
      }
    };
    
    // Element-specific properties
    let newElement: Element;
    
    switch (elementType) {
      case 'heading':
        newElement = {
          ...baseElement,
          content: 'New Heading',
          style: {
            ...baseElement.style,
            fontSize: 32,
            fontWeight: 'bold',
            height: 50
          }
        };
        break;
        
      case 'paragraph':
        newElement = {
          ...baseElement,
          content: 'New paragraph text. Click to edit.',
          style: {
            ...baseElement.style,
            height: 80
          }
        };
        break;
        
      case 'button':
        newElement = {
          ...baseElement,
          content: 'Button',
          style: {
            ...baseElement.style,
            width: 120,
            height: 40,
            backgroundColor: '#3498db',
            color: '#ffffff',
            borderRadius: 4,
            textAlign: 'center',
            padding: 8
          }
        };
        break;
        
      case 'image':
        newElement = {
          ...baseElement,
          src: 'https://via.placeholder.com/200x100',
          alt: 'Placeholder image',
          style: {
            ...baseElement.style,
            objectFit: 'cover'
          }
        };
        break;
        
      case 'video':
        newElement = {
          ...baseElement,
          videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true,
          style: {
            ...baseElement.style,
            objectFit: 'cover'
          }
        };
        break;
        
      case 'shape':
        newElement = {
          ...baseElement,
          shapeType: 'rectangle', // Default shape type
          style: {
            ...baseElement.style,
            backgroundColor: '#3498db',
            width: 150,
            height: 150
          }
        };
        break;
        
      default:
        newElement = baseElement;
    }
    
    // Add the new element to the canvas
    setElements([...elements, newElement]);
    
    // Select the new element
    setSelectedElement(newElement);
  };

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
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center' 
          }}>
            {/* Undo/Redo buttons */}
            {/* Undo button start*/}
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{
                padding: '5px 10px',
                backgroundColor: historyIndex <= 0 ? '#e0e0e0' : '#3498db',
                color: historyIndex <= 0 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Undo (Ctrl+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10H16C18.7614 10 21 12.2386 21 15C21 17.7614 18.7614 20 16 20H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 6L3 10L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Undo
            </button>
            {/* Undo button end*/}
            {/* Redo button start*/}
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              style={{
                padding: '5px 10px',
                backgroundColor: historyIndex >= history.length - 1 ? '#e0e0e0' : '#3498db',
                color: historyIndex >= history.length - 1 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10H8C5.23858 10 3 12.2386 3 15C3 17.7614 5.23858 20 8 20H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 6L21 10L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Redo
            </button>
            {/* Redo button end*/}
            {/* Copy button start*/}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Paste (Ctrl+V)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Paste
              </button>
            )}
          </div>
          {/* Copy button end*/}
        </div>

        {/* Element Toolbar */}
        <ElementToolbar onAddElement={handleAddElement} />

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
      
      {/* History status indicator */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        pointerEvents: 'none'
      }}>
        History: {historyIndex + 1}/{history.length}
      </div>
    </div>
  );
};

export default DesignerRenderer;
