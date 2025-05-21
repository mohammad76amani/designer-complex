import { useCallback, useEffect, useRef, useState } from 'react';
import {  Element } from '@/app/types/template';
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
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [showStyleEditor, setShowStyleEditor] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [elements, setElements] = useState<Element[]>(
    designerSection?.blocks?.elements || []
  );
  const [clipboard, setClipboard] = useState<Element | null>(null);
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
  // History management
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false);
  
  // Initialize history with initial state - only run once
  useEffect(() => {
    const initialState: HistoryState = {
      elements,
      selectedElementId: null
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []); // Empty dependency array to run only once
  
  // Add a new state to the history when elements change
  // Use a ref to track previous elements to avoid infinite loops
  const prevElementsRef = useRef<Element[]>([]);
  const prevSelectedElementRef = useRef<Element | null>(null);
  
  useEffect(() => {
    // Skip if this is from undo/redo
    if (isUndoRedo) {
      setIsUndoRedo(false);
      return;
    }

    // Skip if elements haven't actually changed
    const elementsChanged = JSON.stringify(elements) !== JSON.stringify(prevElementsRef.current);
    const selectedChanged = selectedElement?.id !== prevSelectedElementRef.current?.id;
    
    if (!elementsChanged && !selectedChanged) {
      return;
    }
    
    // Update refs
    prevElementsRef.current = [...elements];
    prevSelectedElementRef.current = selectedElement;
    
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
  }, [elements, selectedElement, historyIndex, history.length, isUndoRedo]);
  
  const handleUpdateElements = (updatedElements: Element[]) => {
    setElements(updatedElements);
  };
  
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
  
  
  const ungroup = (groupElement: Element) => {
    if (groupElement.type !== 'group' || !groupElement.childIds) {
      console.log("Not a group or no child elements");
      return;
    }
    
    console.log("Ungrouping:", groupElement);
    
    // Update the child elements to remove their parent reference and restore absolute positioning
    const updatedElements = elements.map(el => {
      if (el.parentId === groupElement.id) {
        return {
          ...el,
          parentId: undefined,
          style: {
            ...el.style,
            // Restore absolute positioning
            x: el.style.x + groupElement.style.x,
            y: el.style.y + groupElement.style.y
          }
        };
      }
      return el;
    });
    
    // Remove the group element
    const filteredElements = updatedElements.filter(el => el.id !== groupElement.id);
    
    // Update elements and selection
    setElements(filteredElements);
    
    // Select all the child elements that were in the group
    setSelectedElementIds(groupElement.childIds);
    setSelectedElement(null);
    
    console.log("Group removed, children selected");
  };

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

const handleSelectElement = (element: Element | null, isMultiSelect: boolean = false) => {
  if (!element) {
    // If clicking on canvas, clear selection
    setSelectedElement(null);
    setSelectedElementIds([]);
    return;
  }

  if (isMultiSelect) {
    // In multi-select mode, toggle the element in the selection
    setSelectedElementIds(prev => {
      if (prev.includes(element.id)) {
        // If already selected, remove it
        const newIds = prev.filter(id => id !== element.id);
        // Update the selected element to the last one in the array or null
        setSelectedElement(newIds.length > 0 
          ? elements.find(el => el.id === newIds[newIds.length - 1]) || null 
          : null);
        return newIds;
      } else {
        // If not selected, add it
        const newIds = [...prev, element.id];
        setSelectedElement(element);
        return newIds;
      }
    });
  } else {
    // Single selection mode
    setSelectedElement(element);
    setSelectedElementIds([element.id]);
  }

  // Close context menu when selecting a new element
  setContextMenu({ ...contextMenu, show: false });
};


  // Function to update element position and size
  const handleUpdateElement = (updatedElement: Element) => {
    console.log(`Updating element ID: ${updatedElement.id}`, updatedElement);
    
    const updatedElements = elements.map(el =>
      el.id === updatedElement.id ? updatedElement : el
    );
    
    console.log('Updated elements array:', updatedElements);
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
  
  // Function to handle the "Group" 
  const createGroup = () => {
    // Only create a group if multiple elements are selected
    if (selectedElementIds.length <= 1) {
      console.log("Need at least 2 elements to create a group");
      return;
    }
    
    console.log("Creating group with elements:", selectedElementIds);
    
    // Get the selected elements
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  
    // Calculate the bounding box of all selected elements
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    selectedElements.forEach(el => {
      const x = el.style.x;
      const y = el.style.y;
      const width = typeof el.style.width === 'number' ? el.style.width : parseInt(el.style.width as string);
      const height = typeof el.style.height === 'number' ? el.style.height : parseInt(el.style.height as string);
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    // Create a new group element
    const groupId = `group-${Date.now()}`;
    const groupElement = {
      id: groupId,
      type: 'group',
      content: '',
      childIds: selectedElementIds,
      style: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex: Math.max(...selectedElements.map(el => el.style.zIndex || 0)) + 1
      }
    };
    
    // Update the child elements to reference their parent group and adjust their positions
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return {
          ...el,
          parentId: groupId,
          style: {
            ...el.style,
            // Make position relative to the group
            x: el.style.x - minX,
            y: el.style.y - minY
          }
        };
      }
      return el;
    });
    
    // Add the group element to the elements array
    setElements([...updatedElements, groupElement]);
    
    // Select only the group
    setSelectedElementIds([groupId]);
    setSelectedElement(groupElement);
    
    console.log("Group created:", groupElement);
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
        
        // Create a new ID for the pasted element
        const newId = `${clipboard.id}-copy-${Date.now()}`;
        
        // Create a new element positioned near the original
        const newElement: Element = {
          ...clipboard,
          id: newId,
          style: {
            ...clipboard.style,
            // Offset slightly from the original position
            x: clipboard.style.x + 20,
            y: clipboard.style.y + 20
          }
        };
        
        // Add the new element to the canvas
        setElements([...elements, newElement]);
        
        // Select the new element
        setSelectedElement(newElement);
      }
      
      // Group (Ctrl+G or Cmd+G)
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && selectedElementIds.length > 1) {
        e.preventDefault();
        createGroup();
      }
      
      // Ungroup (Ctrl+Shift+G or Cmd+Shift+G)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'g' && 
          selectedElement?.type === 'group') {
        e.preventDefault();
        ungroup(selectedElement);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, elements, clipboard, selectedElementIds]);
  
  // Add a new element to the canvas
  const handleAddElement = (elementType: string) => {
    // Get canvas dimensions
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;
    
    // Calculate center position
    const centerX = canvasWidth / 2 - 100;
    const centerY = canvasHeight / 2 - 50;
    
    // Create a new element based on type
    let newElement: Element;
    
    switch (elementType) {
      case 'heading':
        newElement = {
          id: `heading-${Date.now()}`,
          type: 'heading',
          content: 'New Heading',
          style: {
            x: centerX,
            y: centerY,
            width: 200,
            height: 50,
            fontSize: 24,
            fontWeight: 'bold',
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: elements.length + 1
          }
        };
        break;
        
      case 'paragraph':
        newElement = {
          id: `paragraph-${Date.now()}`,
          type: 'paragraph',
          content: 'New paragraph text. Double-click to edit.',
          style: {
            x: centerX,
            y: centerY,
            width: 300,
            height: 100,
            fontSize: 16,
            fontWeight: 'normal',
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: elements.length + 1
          }
        };
        break;
        
      case 'button':
        newElement = {
          id: `button-${Date.now()}`,
          type: 'button',
          content: 'Click Me',
          href: '#',
          style: {
            x: centerX,
            y: centerY,
            width: 120,
            height: 40,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#3498db',
            borderRadius: 4,
            padding: 0,
            textAlign: 'center',
            zIndex: elements.length + 1
          }
        };
        break;
        
      case 'image':
        newElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          content: '',
          src: 'https://via.placeholder.com/300x200',
          alt: 'Placeholder image',
          style: {
            x: centerX,
            y: centerY,
            width: 300,
            height: 200,
            fontSize: 16,
            fontWeight: 'normal',
            color: '#000000',
            backgroundColor: '#f0f0f0',
            borderRadius: 0,
            padding: 0,
            textAlign: 'center',
            zIndex: elements.length + 1,
            objectFit: 'cover'
          }
        };
        break;
        
      case 'video':
        newElement = {
          id: `video-${Date.now()}`,
          type: 'video',
          content: '',
          videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          style: {
            x: centerX,
            y: centerY,
            width: 320,
            height: 240,
            fontSize: 16,
            fontWeight: 'normal',
            color: '#000000',
            backgroundColor: '#000000',
            borderRadius: 0,
            padding: 0,
            textAlign: 'center',
            zIndex: elements.length + 1,
            objectFit: 'contain'
          }
        };
        break;
        
      case 'shape':
        newElement = {
          id: `shape-${Date.now()}`,
          type: 'shape',
          content: '',
          shapeType: 'rectangle',
          style: {
            x: centerX,
            y: centerY,
            width: 150,
            height: 150,
            fontSize: 16,
            fontWeight: 'normal',
            color: '#000000',
            backgroundColor: '#e74c3c',
            borderRadius: 0,
            padding: 0,
            textAlign: 'center',
            zIndex: elements.length + 1,
            borderWidth: 0,
            borderStyle: 'none',
            borderColor: '#000000'
          }
        };
        break;
        
      default:
        return;
    }
    
    // Add the new element to the canvas
    setElements([...elements, newElement]);
    
    // Select the new element
    setSelectedElement(newElement);
    setSelectedElementIds([newElement.id]);
  };

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
        <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '10px' }}>
          {selectedElementIds.length > 1 && (
            <button
              onClick={createGroup}
              style={{
                padding: '5px 10px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Group Elements ({selectedElementIds.length})
            </button>
          )}
          {clipboard && (
            <button
              onClick={pasteElement}
              style={{
                padding: '5px 10px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Paste Element
            </button>
          )}
        </div>
      </div>

        <div style={{ position: 'relative' }}>
          <ElementToolbar onAddElement={handleAddElement} />
          
          <CanvasRenderer 
            blocks={{ 
              ...blocks, 
              elements: elements 
            }} 
            onSelectElement={handleSelectElement}
            selectedElementIds={selectedElementIds}
            selectedElementId={selectedElement?.id}
            onUpdateElement={handleUpdateElement}
            onUpdateElements={handleUpdateElements}
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
    </div>
  );
};

export default DesignerRenderer;

