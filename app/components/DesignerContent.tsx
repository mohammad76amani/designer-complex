import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { Element } from '@/app/types/template';
import ElementFactoryService from '../services/elementFactoryService';
import ElementManagementService from '../services/elementManagementService';

interface DesignerContextType {
  // Element state
  elements: Element[];
  selectedElementIds: string[];
  selectedElement: Element | null;
  clipboard: Element | null;
  
  // Canvas state
  canvasRef: React.RefObject<HTMLDivElement>;
  currentBreakpoint: 'sm' | 'lg';
  breakpoints: { sm: number; lg: number };
  canvasWidth: number;
  canvasHeight: number;
  
  // UI state
  showStyleEditor: boolean;
  contextMenu: {
    show: boolean;
    x: number;
    y: number;
    element: Element | null;
  };
  
  // Actions
  setElements: (elements: Element[]) => void;
  setSelectedElementIds: (ids: string[]) => void;
  setSelectedElement: (element: Element | null) => void;
  setClipboard: (element: Element | null) => void;
  setShowStyleEditor: (show: boolean) => void;
  setContextMenu: (menu: { show: boolean; x: number; y: number; element: Element | null }) => void;
  setCurrentBreakpoint: (breakpoint: 'sm' | 'lg') => void;
  setCanvasHeight: (height: number) => void;
  
  // Element operations
  updateElement: (element: Element) => void;
  updateElements: (elements: Element[]) => void;
  selectElement: (element: Element | null, isMultiSelect?: boolean) => void;
  addElement: (elementType: string) => void;
  deleteElement: (elementId: string) => void;
  
  // Context menu operations
  openContextMenu: (element: Element | null, x: number, y: number) => void;
  closeContextMenu: () => void;
  
  // Style editor operations
  openStyleEditor: (element: Element) => void;
  closeStyleEditor: () => void;
}

const DesignerContext = createContext<DesignerContextType | undefined>(undefined);

export const useDesigner = () => {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error('useDesigner must be used within a DesignerProvider');
  }
  return context;
};

interface DesignerProviderProps {
  children: React.ReactNode;
  initialElements: Element[];
  initialBreakpoint: 'sm' | 'lg';
  initialBreakpoints: { sm: number; lg: number };
  initialCanvasHeight: number;
  onTemplateUpdate: (elements: Element[]) => void;
  onBreakpointChange: (breakpoint: 'sm' | 'lg') => void;
  onCanvasHeightUpdate: (height: number) => void;
}

export const DesignerProvider: React.FC<DesignerProviderProps> = ({
  children,
  initialElements,
  initialBreakpoint,
  initialBreakpoints,
  initialCanvasHeight,
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
  const [canvasHeight, setCanvasHeight] = useState<number>(initialCanvasHeight);
  
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
  
  // Element operations
  const updateElement = useCallback((element: Element) => {
    console.log('DesignerContext: Updating element', element.id);
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
    console.log('DesignerContext: Updating elements', newElements.length);
    setElements(newElements);
    onTemplateUpdate(newElements);
  }, [onTemplateUpdate]);
  
const selectElement = useCallback((element: Element | null, isMultiSelect: boolean = false) => {
  if (!element) {
    setSelectedElement(null);
    setSelectedElementIds([]);
    return;
  }

  // Ensure element has all required style properties with defaults
  const elementWithDefaults: Element = {
    ...element,
    style: {
   
      opacity: 1,
      borderWidth: 0,
      borderStyle: 'none',
      borderColor: '#000000',
      letterSpacing: 0,
      lineHeight: 1.5,
      boxShadowBlur: 0,
      boxShadowSpread: 0,
      boxShadowColor: 'rgba(0,0,0,0.2)',
      rotate: 0,
      blur: 0,
      brightness: 100,
      contrast: 100,
      objectFit: 'cover',
      ...element.style
    },
    // Ensure animation object exists
    animation: {
      hover: 'none',
      click: 'none',
      ...element.animation
    },
    // Ensure other properties have defaults
    content: element.content || '',
    href: element.href || '',
    target: element.target || '_self',
    src: element.src || '',
    alt: element.alt || '',
    videoSrc: element.videoSrc || '',
    autoplay: element.autoplay || false,
    loop: element.loop || false,
    muted: element.muted || false,
    controls: element.controls !== false, // Default to true
    shapeType: element.shapeType || 'rectangle'
  };

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
        setSelectedElement(elementWithDefaults);
        return newIds;
      }
    });
  } else {
    setSelectedElement(elementWithDefaults);
    setSelectedElementIds([element.id]);
  }

  setContextMenu(prev => ({ ...prev, show: false }));

}, [elements]);  
  const addElement = useCallback((elementType: string, shapeType?: string) => {
    console.log('DesignerContext: Adding element type:', elementType, 'shapeType:', shapeType);
    
    // Calculate center position
    const centerX = canvasWidth / 2 - 100;
    const centerY = canvasHeight / 2 - 50;
    
    // Get canvas bounds for validation
    const canvasBounds = { width: canvasWidth, height: canvasHeight };
    
    try {
      // Create element using factory service with smart positioning and shapeType
      const newElement = ElementFactoryService.createElementWithSmartPositioning(
        elementType,
        { x: centerX, y: centerY },
        elements,
        elements.length + 1,
        10, // max attempts to find non-overlapping position
        shapeType // Pass the shapeType parameter
      );
      
      // Validate element fits in canvas
      const validatedElement = ElementFactoryService.createValidatedElement(
        newElement.type,
        { x: newElement.style.x, y: newElement.style.y },
        newElement.style.zIndex || elements.length + 1,
        canvasBounds,
        newElement
      );
      
      console.log('DesignerContext: Created element:', validatedElement);
      
      // Add the new element to the canvas
      const newElements = [...elements, validatedElement];
      setElements(newElements);
      onTemplateUpdate(newElements);
      
      // Select the new element
      setSelectedElement(validatedElement);
      setSelectedElementIds([validatedElement.id]);
      
    } catch (error) {
      console.error('DesignerContext: Error creating element:', error);
    }
  }, [elements, canvasWidth, canvasHeight, onTemplateUpdate]);
  
  const deleteElement = useCallback((elementId: string) => {
    console.log('DesignerContext: Deleting element', elementId);
    
    const updatedElements = ElementManagementService.deleteElement(elements, elementId);
    setElements(updatedElements);
    onTemplateUpdate(updatedElements);
    
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
      setShowStyleEditor(false);
    }
    
    // Remove from selected elements if it was selected
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
  }, [elements, selectedElement, onTemplateUpdate]);
  
  // Context menu operations
  const openContextMenu = useCallback((element: Element | null, x: number, y: number) => {
    console.log('DesignerContext: Opening context menu', { element: element?.id, x, y });
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
    console.log('DesignerContext: Opening style editor for', element.id);
    setSelectedElement(element);
    setShowStyleEditor(true);
  }, []);
  
  const closeStyleEditor = useCallback(() => {
    setShowStyleEditor(false);
  }, []);
  
  // Handle breakpoint changes
  const handleBreakpointChange = useCallback((breakpoint: 'sm' | 'lg') => {
    console.log('DesignerContext: Changing breakpoint to', breakpoint);
    setCurrentBreakpoint(breakpoint);
    onBreakpointChange(breakpoint);
  }, [onBreakpointChange]);

  // Handle canvas height changes
  const handleCanvasHeightChange = useCallback((height: number) => {
    console.log('DesignerContext: Changing canvas height to', height);
    setCanvasHeight(height);
    onCanvasHeightUpdate(height);
  }, [onCanvasHeightUpdate]);

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
    canvasHeight,
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
    setCanvasHeight: handleCanvasHeightChange,
    
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
