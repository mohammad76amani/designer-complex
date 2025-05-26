import { useCallback, useEffect, useRef, useState } from 'react';
import {  Element } from '@/app/types/template';
import CanvasRenderer from './CanvasRenderer';
import ContextMenu from './ContextMenu';
import FloatingStyleEditor from './FloatingStyleEditor';
import ElementToolbar from './ElementToolbar';
import { DesignerRendererProps,DirectionSetting } from '@/app/types/template';
import ElementManagementService from '../services/elementManagementService';
import HistoryService from '../services/historyService';
import ElementFactoryService from '../services/elementFactoryService';

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
  const handleUpdateElements = (updatedElements: Element[]) => {
    setElements(updatedElements);
  };
  
  // Initialize history service - only run once
  useEffect(() => {
    HistoryService.initialize(elements, selectedElementIds, selectedElement?.id || null);
  }, []); // Empty dependency array to run only once

  // Track changes and add to history
  useEffect(() => {
    // Skip if this is from undo/redo
    if (HistoryService.isPerformingUndoRedo()) {
      return;
    }

    // Add state to history when elements or selection changes
    HistoryService.addState(
      elements, 
      selectedElementIds, 
      selectedElement?.id || null,
      'Canvas update'
    );
  }, [elements, selectedElementIds, selectedElement]);

  // Undo function
  const handleUndo = useCallback(() => {




    const previousState = HistoryService.undo();
    if (previousState) {
      setElements(previousState.elements);
      setSelectedElementIds(previousState.selectedElementIds);
      



      if (previousState.selectedElementId) {
        const selectedEl = previousState.elements.find(el => el.id === previousState.selectedElementId);
        setSelectedElement(selectedEl || null);
      } else {
        setSelectedElement(null);
      }


    }


  }, []);

  // Redo function
  const handleRedo = useCallback(() => {



    const nextState = HistoryService.redo();
    if (nextState) {
      setElements(nextState.elements);
      setSelectedElementIds(nextState.selectedElementIds);
      

      if (nextState.selectedElementId) {
        const selectedEl = nextState.elements.find(el => el.id === nextState.selectedElementId);
        setSelectedElement(selectedEl || null);
      } else {
        setSelectedElement(null);
      }


    }

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

        if (HistoryService.canUndo()) {
          handleUndo();
        }
      }
      
      // Redo: Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();

        if (HistoryService.canRedo()) {
          handleRedo();
        }
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

  const sectionStyle:DirectionSetting  = {
    paddingTop: `${setting?.paddingTop}px`,
    paddingBottom: `${setting?.paddingBottom}px`,
    paddingLeft: `${setting?.paddingLeft}px`,
    paddingRight: `${setting?.paddingRight}px`,
    marginTop: `${setting?.marginTop}px`,
    marginBottom: `${setting?.marginBottom}px`,
    backgroundColor: `#${setting?.backgroundColor.toString() || "000000"}`,
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
  
  // Don't create checkpoint for every small update (like dragging)
  // The useEffect will handle adding to history
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
    // Create checkpoint before deletion
    HistoryService.createCheckpoint(
      elements, 
      selectedElementIds, 
      selectedElement?.id || null,
      `Delete ${contextMenu.element.type} element`
    );
    
    const updatedElements = ElementManagementService.deleteElement(
      elements, 
      contextMenu.element.id
    );
    setElements(updatedElements);
    
    if (selectedElement && selectedElement.id === contextMenu.element.id) {
      setSelectedElement(null);
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
    const updatedElements = ElementManagementService.deleteElement(
      elements, 
      contextMenu.element.id
    );
    setElements(updatedElements);
    
    if (selectedElement && selectedElement.id === contextMenu.element.id) {
      setSelectedElement(null);
    }
    closeContextMenu();
  }
};

  // Function to paste the copied/cut element
const pasteElement = () => {
  if (clipboard && canvasRef.current) {
    // Get canvas position for coordinate adjustment
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate the position relative to the canvas
    const canvasX = contextMenu.x - canvasRect.left;
    const canvasY = contextMenu.y - canvasRect.top;
    
    // Use factory service to create from clipboard
    const newElement = ElementFactoryService.createFromClipboard(
      clipboard,
      { 
        x: Math.max(0, canvasX - (clipboard.style.width as number) / 2),
        y: Math.max(0, canvasY - (clipboard.style.height as number) / 2)
      }
    );
    
    // Validate element fits in canvas
    const canvasBounds = {
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight
    };
    
    const validatedElement = ElementFactoryService.createValidatedElement(
      newElement.type,
      { x: newElement.style.x, y: newElement.style.y },
      newElement.style.zIndex || elements.length + 1,
      canvasBounds,
      newElement
    );
    
    // Create checkpoint for history
    const newElements = [...elements, validatedElement];
    HistoryService.createCheckpoint(
      newElements, 
      [validatedElement.id], 
      validatedElement.id,
      `Paste ${clipboard.type} element`
    );
    
    // Add the new element to the canvas
    setElements(newElements);
    
    // Select the new element
    setSelectedElement(validatedElement);
    setSelectedElementIds([validatedElement.id]);
    
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
  
  // Create checkpoint before grouping
  HistoryService.createCheckpoint(
    elements, 
    selectedElementIds, 
    selectedElement?.id || null,
    `Group ${selectedElementIds.length} elements`
  );
  
  // Use factory service to create group
  const { group, updatedElements } = ElementFactoryService.createGroupFromElements(selectedElements);
  
  // Update the elements array: remove selected elements and add updated ones + group
  const remainingElements = elements.filter(el => !selectedElementIds.includes(el.id));
  const finalElements = [...remainingElements, ...updatedElements, group];
  
  // Update state
  setElements(finalElements);
  
  // Select only the group
  setSelectedElementIds([group.id]);
  setSelectedElement(group);
  
  console.log("Group created:", group);
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
        
        // Use factory service to clone element
        const newElement = ElementFactoryService.cloneElement(
          clipboard,
          {
            x: clipboard.style.x + 20,
            y: clipboard.style.y + 20
          },
          `keyboard-paste-${Date.now()}`
        );
        
        // Validate element fits in canvas
        const canvasBounds = canvasRef.current ? {
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight
        } : undefined;
        
        const validatedElement = canvasBounds 
          ? ElementFactoryService.createValidatedElement(
              newElement.type,
              { x: newElement.style.x, y: newElement.style.y },
              newElement.style.zIndex || elements.length + 1,
              canvasBounds,
              newElement
            )
          : newElement;
        
        // Add the new element to the canvas
        const newElements = [...elements, validatedElement];
        setElements(newElements);
        
        // Select the new element
        setSelectedElement(validatedElement);
        setSelectedElementIds([validatedElement.id]);
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, elements, clipboard, selectedElementIds]);
  
  // Add a new element to the canvas
 // Replace handleAddElement with smart positioning

const handleAddElement = (elementType: string) => {
  // Get canvas dimensions
  const canvasWidth = canvasRef.current?.clientWidth || 800;
  const canvasHeight = canvasRef.current?.clientHeight || 600;
  
  // Calculate center position
  const centerX = canvasWidth / 2 - 100;
  const centerY = canvasHeight / 2 - 50;
  
  // Get canvas bounds for validation
  const canvasBounds = { width: canvasWidth, height: canvasHeight };
  
  // Create element using factory service with smart positioning
  const newElement = ElementFactoryService.createElementWithSmartPositioning(
    elementType,
    { x: centerX, y: centerY },
    elements,
    elements.length + 1,
    10 // max attempts to find non-overlapping position
  );
  
  // Validate element fits in canvas
  const validatedElement = ElementFactoryService.createValidatedElement(
    newElement.type,
    { x: newElement.style.x, y: newElement.style.y },
    newElement.style.zIndex || elements.length + 1,
    canvasBounds,
    newElement
  );
  
  // Create checkpoint for history
  const newElements = [...elements, validatedElement];
  HistoryService.createCheckpoint(
    newElements, 
    [validatedElement.id], 
    validatedElement.id,
    `Add ${elementType} element`
  );
  
  // Add the new element to the canvas
  setElements(newElements);
  
  // Select the new element
  setSelectedElement(validatedElement);
  setSelectedElementIds([validatedElement.id]);
};


  // Add this useEffect to ensure showStyleEditor is false when no element is selected
  useEffect(() => {
    if (!selectedElement && showStyleEditor) {
      setShowStyleEditor(false);
    }
  }, [selectedElement, showStyleEditor]);

  // Add this to DesignerRenderer or create a new component
  const ElementStatsPanel = () => {
    const stats = ElementManagementService.getElementStatistics(elements);
    
    return (
      <div className="element-stats">
        <h4>Canvas Statistics</h4>
        <p>Total Elements: {stats.total}</p>
        <p>Locked: {stats.locked}</p>
        <p>Grouped: {stats.grouped}</p>
        <p>Top Level: {stats.topLevel}</p>
        <div>
          <h5>By Type:</h5>
          {Object.entries(stats.byType).map(([type, count]) => (
            <p key={type}>{type}: {count}</p>
          ))}
        </div>
      </div>
    );
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
        <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '10px' }}>
          {/* Undo/Redo buttons */}
          <button
            onClick={handleUndo}
            disabled={!HistoryService.canUndo()}
            style={{
              padding: '5px 10px',
              backgroundColor: HistoryService.canUndo() ? '#6c757d' : '#e9ecef',
              color: HistoryService.canUndo() ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '4px',
              cursor: HistoryService.canUndo() ? 'pointer' : 'not-allowed'
            }}
            title={HistoryService.getUndoDescription() || 'Nothing to undo'}
          >
            ↶ Undo
          </button>
          
          <button
            onClick={handleRedo}
            disabled={!HistoryService.canRedo()}
            style={{
              padding: '5px 10px',
              backgroundColor: HistoryService.canRedo() ? '#6c757d' : '#e9ecef',
              color: HistoryService.canRedo() ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '4px',
              cursor: HistoryService.canRedo() ? 'pointer' : 'not-allowed'
            }}
            title={HistoryService.getRedoDescription() || 'Nothing to redo'}
          >
            ↷ Redo
          </button>

          {/* Existing buttons */}
          {selectedElementIds.length > 1 && (
            <button onClick={createGroup}>
              Group Elements ({selectedElementIds.length})
            </button>
          )}
          
          {/* History info for debugging */}
          {process.env.NODE_ENV === 'development' && (
            <span style={{ fontSize: '11px', color: '#999' }}>
              History: {HistoryService.getCurrentIndex() + 1}/{HistoryService.getHistoryLength()}
            </span>
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
              canvasRef={canvasRef}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignerRenderer;

