import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { DesignerContextType, Element } from '@/app/types/template';
import ElementFactoryService from '../services/elementFactoryService';
import ElementManagementService from '../services/elementManagementService';


const DesignerContext = createContext<DesignerContextType | undefined>(undefined);

export const useDesigner = () => {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error('useDesigner must be used within a DesignerProvider');
  }
  return context;
};



export const DesignerProvider: React.FC<DesignerProviderProps> = ({
  children,
  initialElements,
  initialBreakpoint,
  initialBreakpoints,
  initialCanvasHeight = 600, // Add default
  onTemplateUpdate,
  onBreakpointChange,
  onCanvasHeightUpdate
}) => {
  // Element state
  const [elements, setElements] = useState<Element[]>(initialElements);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [clipboard, setClipboard] = useState<Element | null>(null);
  
  // Canvas state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'sm' | 'lg'>(initialBreakpoint);
  const [breakpoints] = useState(initialBreakpoints);
  const [canvasHeight, setCanvasHeight] = useState<number>(initialCanvasHeight); // Add this state
  
  // UI state
  const [showStyleEditor, setShowStyleEditor] = useState<boolean>(false);
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
  
  // Computed values
  const canvasWidth = breakpoints[currentBreakpoint];
  
  // Canvas height update handler
  const handleCanvasHeightUpdate = useCallback((height: number) => {
    setCanvasHeight(height);
    onCanvasHeightUpdate(height);
  }, [onCanvasHeightUpdate]);
  
  // Element operations
  const updateElement = useCallback((element: Element) => {
    const updatedElements = elements.map(el =>
      el.id === element.id ? element : el
    );
    setElements(updatedElements);
    onTemplateUpdate(updatedElements);
    
    if (selectedElement && selectedElement.id === element.id) {
      setSelectedElement(element);
    }
  }, [elements, selectedElement, onTemplateUpdate]);
  
  const updateElements = useCallback((newElements: Element[]) => {
    setElements(newElements);
    onTemplateUpdate(newElements);
  }, [onTemplateUpdate]);
  
  const selectElement = useCallback((element: Element | null, isMultiSelect: boolean = false) => {
    if (!element) {
      setSelectedElement(null);
      setSelectedElementIds([]);
      return;
    }

    if (isMultiSelect) {
      setSelectedElementIds(prev => {
        if (prev.includes(element.id)) {
          const newIds = prev.filter(id => id !== element.id);
          setSelectedElement(newIds.length > 0 
            ? elements.find(el => el.id === newIds[newIds.length - 1]) || null 
            : null);
          return newIds;
        } else {
          const newIds = [...prev, element.id];
          setSelectedElement(element);
          return newIds;
        }
      });
    } else {
      setSelectedElement(element);
      setSelectedElementIds([element.id]);
    }

    setContextMenu(prev => ({ ...prev, show: false }));
  }, [elements]);
  
  const addElement = useCallback((elementType: string) => {
    console.log('Adding element:', elementType); // Debug log
    
    // Get canvas dimensions
    const canvasBounds = { width: canvasWidth, height: canvasHeight };
    
    // Calculate center position
    const centerX = Math.max(50, canvasWidth / 2 - 100);
    const centerY = Math.max(50, canvasHeight / 2 - 50);
    
    console.log('Canvas bounds:', canvasBounds); // Debug log
    console.log('Center position:', { x: centerX, y: centerY }); // Debug log
    
    try {
      // Create element using factory service
      const newElement = ElementFactoryService.createElement(
        elementType,
        { x: centerX, y: centerY },
        elements.length
      );
      
      console.log('Created element:', newElement); // Debug log
      
      // Add the new element to the canvas
      const newElements = [...elements, newElement];
      setElements(newElements);
      onTemplateUpdate(newElements);
      
      // Select the new element
      setSelectedElement(newElement);
      setSelectedElementIds([newElement.id]);
      
      console.log('Element added successfully'); // Debug log
    } catch (error) {
      console.error('Error adding element:', error);
    }
  }, [elements, canvasWidth, canvasHeight, onTemplateUpdate]);
  
  const deleteElement = useCallback((elementId: string) => {
    const updatedElements = ElementManagementService.deleteElement(elements, elementId);
    setElements(updatedElements);
    onTemplateUpdate(updatedElements);
    
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
      setShowStyleEditor(false);
    }
    
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
  }, [elements, selectedElement, onTemplateUpdate]);
  
  // Context menu operations
  const openContextMenu = useCallback((element: Element | null, x: number, y: number) => {
    setContextMenu({
      show: true,
      x,
      y,
      element
    });
  }, []);
  
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, show: false }));
  }, []);
  
  // Style editor operations
  const openStyleEditor = useCallback((element: Element) => {
    setSelectedElement(element);
    setShowStyleEditor(true);
  }, []);
  
  const closeStyleEditor = useCallback(() => {
    setShowStyleEditor(false);
  }, []);
  
  // Handle breakpoint changes
  const handleBreakpointChange = useCallback((breakpoint: 'sm' | 'lg') => {
    setCurrentBreakpoint(breakpoint);
    onBreakpointChange(breakpoint);
  }, [onBreakpointChange]);

  const value: DesignerContextType = {
    // State
    elements,
    selectedElementIds,
    selectedElement,
    clipboard,
    canvasRef,
    currentBreakpoint,
    breakpoints,
    canvasWidth,
    canvasHeight, // Now from state
    showStyleEditor,
    contextMenu,
    
    // Setters
    setElements,
    setSelectedElementIds,
    setSelectedElement,
    setClipboard,
    setShowStyleEditor,
    setContextMenu,
    setCurrentBreakpoint: handleBreakpointChange,
    setCanvasHeight: handleCanvasHeightUpdate, // Add this
    
    // Operations
    updateElement,
    updateElements,
    selectElement,
    addElement,
    deleteElement,
    openContextMenu,
    closeContextMenu,
    openStyleEditor,
    closeStyleEditor
  };

  return (
    <DesignerContext.Provider value={value}>
      {children}
    </DesignerContext.Provider>
  );
};